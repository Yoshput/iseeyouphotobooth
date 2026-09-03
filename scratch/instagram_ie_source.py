    def _real_extract(self, url):
        video_id, url = self._match_valid_url(url).group('id', 'url')
        media_id = str(_id_to_pk(video_id))

        if self._is_logged_in:
            try:
                return self._extract_product(self._download_json(
                    f'{self._API_BASE_URL}/media/{media_id}/info/', video_id,
                    'Downloading video info', 'Video info extraction failed',
                    impersonate=self._can_impersonate and self._is_web_app,
                    headers=self._api_headers)['items'][0])
            except ExtractorError as e:
                if not (isinstance(e.cause, HTTPError) and self._is_login_redirect(e.cause.response.url)):
                    raise

            self.report_warning('The provided Instagram account cookies are no longer valid')
            # XXX: With curl-cffi, the error response may not invalidate the cookie in our jar
            for domain in self._COOKIE_DOMAINS:
                self.cookiejar.clear(domain=domain, path='/', name=self._AUTH_COOKIE_NAME)
            # Re-initialize to set lsd token for logged-out extraction
            self._real_initialize()

        api_check = self._download_json(
            f'{self._API_BASE_URL}/web/get_ruling_for_content/', video_id,
            'Checking post accessibility', errnote=False, fatal=False,
            impersonate=self._can_impersonate, headers=self._api_headers,
            query={'content_type': 'MEDIA', 'target_id': media_id}) or {}

        csrf_token = self._get_cookies('https://www.instagram.com').get('csrftoken')
        if not csrf_token:
            self.report_warning('No CSRF token set by Instagram API', video_id)
        else:
            csrf_token = csrf_token.value if api_check.get('status') == 'ok' else None
            if not csrf_token:
                self.report_warning('Instagram API is not granting access', video_id)

        response = self._download_json(
            'https://www.instagram.com/api/graphql', video_id,
            fatal=False, impersonate=True,
            headers=filter_dict({
                **self._api_headers,
                'X-FB-Friendly-Name': 'PolarisLoggedOutDesktopWWWPostRootContentQuery',
                'X-CSRFToken': csrf_token,
                'X-FB-LSD': self._lsd_token,
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': url,
            }), data=urlencode_postdata({
                'lsd': self._lsd_token,
                'fb_api_caller_class': 'RelayModern',
                'fb_api_req_friendly_name': 'PolarisLoggedOutDesktopWWWPostRootContentQuery',
                'server_timestamps': 'true',
                'variables': json.dumps({'media_id': media_id}, separators=(',', ':')),
                'doc_id': '27130156389949648',
            })) if self._can_impersonate else None

        media = traverse_obj(response, ('data', 'xig_polaris_media', {dict}))
        product_info = traverse_obj(media, ('if_not_gated_logged_out', {dict}))

        if not product_info:
            error = join_nonempty('title', 'description', delim=': ', from_dict=api_check)
            if 'Restricted Video' in error:
                self.raise_login_required(error)
            elif error:
                raise ExtractorError(error, expected=True)
            elif len(video_id) > 28:
                # It's a private post (video_id == shortcode + 28 extra characters)
                # Only raise after getting empty response; sometimes "long"-shortcode posts are public
                self.raise_login_required(
                    'This content is only available for registered users who follow this account')

            webpage, urlh = self._download_webpage_handle(
                f'https://www.instagram.com/p/{video_id}', video_id, impersonate=self._can_impersonate)
            if self._is_login_redirect(urlh.url):
                self.raise_login_required(
                    'The webpage request was redirected to the login page. '
                    'You have exceeded the rate-limit for accessing posts anonymously')

            media = traverse_obj(webpage, (
                {self._SJS_RE.findall}, ..., {json.loads},
                'require', ..., ..., ..., '__bbox', 'require',
                lambda _, v: v[0] == 'RelayPrefetchedStreamCache', ...,
                lambda _, v: v['__bbox']['result']['data']['xig_polaris_media'],
                '__bbox', 'result', 'data', 'xig_polaris_media', {dict}, any))
            product_info = traverse_obj(media, ('if_not_gated_logged_out', {dict}))

        if not product_info:
            raise ExtractorError(
                'Instagram sent an empty media response. Check if this post is accessible in your '
                f'browser without being logged-in. If it is not, then u{self._login_hint()[1:]}. '
                'Otherwise, if the post is accessible in browser without being logged-in'
                f'{bug_reports_message(before=",")}', expected=True)

        info_dict = self._extract_product(product_info, video_id=video_id, get_comments=False)
        is_playlist = info_dict.get('_type') == 'playlist'
        if not is_playlist and not info_dict.get('formats'):
            self.raise_no_formats('There is no video in this post', expected=True)

        comments = traverse_obj(media, (
            'comments_connection', 'edges', lambda _, v: v['node']['text'], 'node', {
                'author': ('user', 'username', {str}),
                'author_id': ('user', 'pk', {str_or_none}),
                'id': ('pk', {str_or_none}),
                'text': ('text', {str}),
                'timestamp': ('created_at', {int_or_none}),
                'like_count': ('comment_like_count', {int_or_none}),
            }))

        if is_playlist:
            for entry in info_dict['entries']:
                entry['comments'] = comments
        else:
            info_dict['comments'] = comments

        return info_dict

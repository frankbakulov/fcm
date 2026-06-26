/* @ts-self-types="./mod.d.ts" */
import { GoogleAuth } from 'google-auth-library';
import * as f from '@frankbakulov/utils';

export class Fcm {
	credentials = null;
	auth = null;

	/**
	 * @param {Object} options
	 * @param {String} options.serviceAccountFile
	 */
	constructor(options = {}) {
		var sa = f.readJsonSync(options.serviceAccountFile || './restricted/firebase-service-account.json') || {};

		if (!sa.client_email || !sa.private_key || !sa.project_id) {
			throw new Error('FCM service account JSON is missing client_email / private_key / project_id');
		}

		this.credentials = sa;
	}

	accessToken() {
		this.auth ||= new GoogleAuth({
			credentials: this.credentials,
			scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
		});

		return this.auth.getClient()
			.then(client => client.getAccessToken())
			.then(token => typeof token === 'string' ? token : token?.token)
			.then(token => {
				if (!token) throw new Error('FCM access token not available');
				return token;
			});
	}

	/**
	 * @param {String[]} tokens - fcm device tokens
	 * @param {Object} notification
	 * @param {String} notification.title
	 * @param {String} notification.body
	 * @param {Object} data
	 */
	send(tokens, notification = {}, data = {}) {
		if (!tokens.length) return [];

		return this.accessToken().then(bearerToken => {
			var url = `https://fcm.googleapis.com/v1/projects/${this.credentials.project_id}/messages:send`,
				message = {
					token: '',
					notification,
					data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v ?? '')])),
				},
				headers = {
					Authorization: `Bearer ${bearerToken}`,
					'Content-Type': 'application/json',
				};

			return Promise.allSettled(tokens.map((token) => {
				message.token = token;

				return fetch(url, {
					method: 'POST',
					headers,
					body: JSON.stringify({ message }),
				}).then((r) => {
					return r.ok
						? r.json()
						: r.text().then(text => { throw new Error(text); });
				});
			}));
		});
	}
}
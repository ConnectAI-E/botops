import fetch from 'node-fetch'

export interface FeishuLoginCookies {
  lark_oapi_csrf_token: string
  session: string
  baseUrl?: string
  domain?: string
}

export interface BaseUserInfo {
  displayName: string
  avatar: string
  csrfToken: string
}

export class Configuration {
  _session: string
  _lark_oapi_csrf_token: string
  _csrfToken: string
  baseUrl: string

  constructor(opt: FeishuLoginCookies) {
    this._session = opt.session
    this._lark_oapi_csrf_token = opt.lark_oapi_csrf_token
    this.baseUrl = opt.baseUrl || (opt.domain ? `https://${opt.domain}` : '') || 'https://open.feishu.cn'
    this._csrfToken = ''
    // this.processCsrfToken().then(() => {
    //   console.log("csrfToken", this._csrfToken)
    // } )
  }

  get aRawRequest() {
    return fetch
  }

  get headers() {
    const headers = {} as any
    headers.Cookie = `session=${this._session}; lark_oapi_csrf_token=${this._lark_oapi_csrf_token}`
    if (this._csrfToken)
      headers['x-csrf-token'] = this._csrfToken

    return headers
  }

  async fetchRequestText(url, options) {
    const response = await fetch(url, options)
    if (!response.ok)
      throw new Error(`Network response was not ok: ${response.status} - ${response.statusText}`)

    return response.text()
  }

  async fetchRequestJson(url, options) {
    const response = await fetch(url, options)
    if (!response.ok)
      throw new Error(`Network response was not ok: ${response.status} - ${response.statusText}`)

    return response.json()
  }

  aGetRequest(url: string): any {
    const link = `${this.baseUrl}/${url}`
    const options = {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      referrerPolicy: 'no-referrer',
      cors: true,
      headers: this.headers,
    }
    return this.fetchRequestJson(link, options)
  }

  aPostRequest(url: string, body?: any): any {
    const link = `${this.baseUrl}/${url}`
    const options = {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      referrerPolicy: 'no-referrer',
      headers: this.headers,
      redirect: 'follow',
      body: JSON.stringify(body),
    }
    return this.fetchRequestJson(link, options)
  }

  aPostMultipartRequest(url: string, body?: any): any {
    const link = `${this.baseUrl}/${url}`
    const options = {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      referrerPolicy: 'no-referrer',
      headers: this.headers,
      redirect: 'follow',
      body,
    }
    return this.fetchRequestJson(link, options)
  }

  aPutRequest(url: string, body: any): any {
    const link = `${this.baseUrl}/${url}`
    const options = {
      method: 'PUT',
      mode: 'cors',
      credentials: 'include',
      referrerPolicy: 'no-referrer',
      headers: this.headers,
      redirect: 'follow',
      body: JSON.stringify(body),
    }
    return this.fetchRequestJson(link, options)
  }

  aDeleteRequest(url: string): any {
    const link = `${this.baseUrl}/${url}`
    const options = {
      method: 'DELETE',
      mode: 'cors',
      credentials: 'include',
      referrerPolicy: 'no-referrer',
      headers: this.headers,
      redirect: 'follow',
    }
    return this.fetchRequestJson(link, options)
  }

  async requestBaseApp() {
    const url = `${this.baseUrl}/app?lang=zh-CN`
    const options = {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      referrerPolicy: 'no-referrer',
      headers: this.headers,
    }
    // console.log(options)
    return await this.fetchRequestText(url, options)
  }

  async processCsrfToken() {
    const result = await this.requestBaseApp() as any
    const content = result
    const csrfToken = this.parseCsrfToken(content)
    this._csrfToken = csrfToken as string
    return csrfToken
  }

  async getUserInfo(): Promise<BaseUserInfo> {
    const result = await this.requestBaseApp() as any
    const content = result
    const displayName = this.parseDisplayName(content) as string
    const avatar = this.parseAvatarUrl(content) as string
    const csrfToken = this.parseCsrfToken(content) as string
    // console.log(displayName, avatar, csrfToken)
    return {
      displayName,
      avatar,
      csrfToken,
    }
  }

  async getNickname(): Promise<string> {
    const result = await this.requestBaseApp() as any
    const content = result
    const displayName = this.parseDisplayName(content) as string
    return displayName
  }

  parseDisplayName(content: string) {
    const displayNameRegex = /"displayName":{"value":"([^"]+)"/
    const displayNameMatch = content.match(displayNameRegex)
    const displayName = displayNameMatch ? displayNameMatch[1] : null
    return displayName
  }

  parseAvatarUrl(content: string) {
    const avatarRegex = /"avatar":"([^"]+)"/
    const avatarMatch = content.match(avatarRegex)
    const avatar = avatarMatch ? avatarMatch[1] : null
    return avatar
  }

  parseCsrfToken(content: string) {
    const csrfTokenRegex = /window.csrfToken="([^"]+)";/
    const csrfTokenMatch = content.match(csrfTokenRegex)
    const csrfToken = csrfTokenMatch ? csrfTokenMatch[1] : null
    return csrfToken
  }

  async isAuthed() {
    let nickName: string | null
    try {
      nickName = await this.getNickname()
    }
    catch (e) {
      // console.log(e)
      return false
    }
    // console.log(nickName);
    return nickName !== null
  }
}

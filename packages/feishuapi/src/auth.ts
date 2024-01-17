import puppeteer from 'puppeteer-core'

async function getCookies(loginUrl) {
  let result
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: false,
    args: ['--window-size=500,700'], // 设置浏览器窗口的大小
  }) // 设置 headless 为 false 以打开浏览器窗口
  try {
    const page = await browser.newPage()
    page.setViewport({ width: 500, height: 700 })
    await page.goto(loginUrl)
    // 这里需要一些机制来等待用户登录
    await waitForUserLogin(page)
    const cookies = await page.cookies()

    const filterCookie = cookies.filter((item) => {
      return item.name === 'lark_oapi_csrf_token' || item.name === 'session'
    }).map(({ name, value }) => ({ name, value }))
    result = filterCookie.reduce((acc, { name, value }) => {
      acc[name] = value
      return acc
    }, {})
    await browser.close()
  }
  catch (e) {
    await browser.close()
    console.log(e)
    return result
  }
  return result
}

async function checkLogin(page) {
  // 实现检查登录状态的逻辑，根据是否含有特定cookie
  const cookies = await page.cookies()
  const isLoggedIn = cookies.some(cookie => cookie.name === 'session')
  return isLoggedIn
}

async function waitForUserLogin(page) {
  // 等待用户登录,直到元素渲染
  const loggedInElement = await page.waitForSelector('._pp-header-avatar-box', {
    visible: true,
    timeout: 0,
  })

  // // 登录后再次获取 cookies
  // const cookies = await page.cookies();
  // console.log(cookies);

  // 根据所需 cookie 是否获取到来确定是否登录成功
  // if (loggedInElement) {
  //     console.log('登录成功');
  //     return ;
  // } else {
  //     console.log('登录失败');
  //     return;
  // }
}

export function getFeishuCookies() {
  const loginUrl = 'https://login.feishu.cn/accounts/page/login?app_id=7&redirect_uri=https%3A%2F%2Fopen.feishu.cn%2F'
  return getCookies(loginUrl)
}

// getFeishuCookies().then(cookies => console.log(cookies)).catch(err => console.error(err));

export function FormatCookie(cookies: string) {
  const cookieArr = cookies.split(';')
  const result = [] as any
  cookieArr.forEach((item) => {
    const [name, value] = item.split('=')
    result.push({ name: name.trim(), value })
  },
  )
  return result
}

export function FilterCookie(cookies): object {
  const filterArr = cookies.filter((item) => {
    return item.name === 'lark_oapi_csrf_token' || item.name === 'session'
  }).map(({ name, value }) => ({ name, value }))

  const out = filterArr.reduce((acc, { name, value }) => {
    acc[name] = value
    return acc
  }, {})
  return out
}

export function GetFeishuCookieByStr(cookies: string) {
  const cookieObj = FormatCookie(cookies)
  const targetCookie = FilterCookie(cookieObj)
  return targetCookie
}

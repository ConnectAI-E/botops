import puppeteer from 'puppeteer-core'

async function getCookies(loginUrl) {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: false }) // 设置 headless 为 false 以打开浏览器窗口
  const page = await browser.newPage()
  await page.goto(loginUrl)
  // 这里需要一些机制来等待用户登录
  await waitForUserLogin(page)
  const cookies = await page.cookies()

  const filterCookie = cookies.filter((item) => {
    return item.name === 'lark_oapi_csrf_token' || item.name === 'session'
  }).map(({ name, value }) => ({ name, value }))
  const data = filterCookie.reduce((acc, { name, value }) => {
    acc[name] = value
    return acc
  }, {})
  await browser.close()
  // 退出
  return data
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

getFeishuCookies().then(cookies => console.log(cookies)).catch(err => console.error(err))

import type { Page } from 'puppeteer-core'
import puppeteer from 'puppeteer-core'

async function getCookies(url: string) {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: false }) // 设置 headless 为 false 以打开浏览器窗口
  try {
    const page = await browser.newPage()
    await page.goto(url)
    // 这里需要一些机制来等待用户登录
    await waitForUserLogin(page)
    const cookies = await page.cookies()

    const filterCookie = cookies.filter((item) => {
      return item.name === 'access_token' || item.name === 'account' || item.name === 'deviceid' || item.name === 'corp_id' || item.name === '_o_a_u'
    }).map(({ name, value }) => ({ name, value }))
    const data = filterCookie.reduce((acc, { name, value }) => {
      acc[name] = value
      return acc
    }, {})
    await browser.close()
    return data
  }
  catch (e) {
    await browser.close()
    console.log(e)
  }
}

// async function checkLogin(page) {
//   // 实现检查登录状态的逻辑，根据是否含有特定cookie
//   const cookies = await page.cookies()
//   const isLoggedIn = cookies.some(cookie => cookie.name === 'access_token')
//   return isLoggedIn
// }

async function waitForUserLogin(page: Page) {
  // 等待用户登录
  const loggedInElement = await page.waitForSelector('.opdf-dev-header', { visible: true, timeout: 0 })

  // 登录后再次获取 cookies
  // const cookies = await page.cookies()

  // 根据所需 cookie 是否获取到来确定是否登录成功
  // if (loggedInElement) {
  //   console.log('登录成功')
  //   return cookies
  // }
  // else {
  //   console.log('登录失败')
  // }
}

// getCookies('https://open-dev.dingtalk.com/', 'https://open-dev.dingtalk.com/')
//     .then(cookies => console.log(cookies))
//     .catch(err => console.error(err));

export function getDingtalkCookies() {
  const loginUrl = 'https://open-dev.dingtalk.com/'
  return getCookies(loginUrl)
}

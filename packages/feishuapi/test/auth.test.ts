import { describe, expect, it } from 'vitest'
import { FilterCookie, FormatCookie, getFeishuCookies } from '../src/auth'

describe('test cookies', () => {
  it.skip('should be able to get cookies', async () => {
    const cookie = await getFeishuCookies()
    console.log(cookie)
    console.log(cookie)
    expect(1).toBe(1)
  })

  const mockCookies = '__tea__ug__uid=6181041662970808531; passport_web_did=7143035153751818241; trust_browser_id=6187447b-8c93-4944-8d31-7930901f83f3; fid=e063b81d-ecc5-49d4-99f8-f0037b2ce899; deviceId=clbm0ynll00003b6kdaap2bkq; _ga=GA1.3.1721306984.1662970809; _ga_VPYRHN104D=deleted; open_locale=zh-CN; lang=zh; _ga_P18SJM24J5=GS1.1.1693908561.1.1.1693909167.0.0.0; is_anonymous_session=; X-Risk-Browser-Id=e5d5a2b34d480e052e17ba368156676bf9199deceda1ee659a905ae122935f7c; QXV0aHpDb250ZXh0=700dc869f88e4350825327585760e30f; _ga_VPYRHN104D=deleted; _gcl_au=1.1.572484683.1702563713; SLARDAR_WEB_ID=85aa983d-7ed0-4d1a-b14e-5692c1f0efb2; _csrf_token=29852669a24347e6ceca17f9be22ccd8f3ce1bee-1704869362; lgw_csrf_token=d1e335d67e0565fe51a83a790ab4c698b64b716c-1704871157; _gid=GA1.2.1197535182.1704956700; _gid=GA1.3.1197535182.1704956700; help_center_session=afec78f9-8fdb-4e80-b113-f1f9b8c55095; _uuid_hera_ab_path_1=7324138917484347394; Hm_lvt_e78c0cb1b97ef970304b53d2097845fd=1703489206,1703844904,1705067791; csrf_token=2b7a18b2-ff66-4027-abb2-243c413166e3; m_65f68ea2=32623761313862322d666636362d343032372d616262322d32343363343133313636653346111c051538e0cc44e1d1f309c607eaed4c1984060d7ebff8b389a1905e6d7d; X-Larkgw-Web-DID=7814062180488102744; X-Larkgw-Use-Lark-Session-119=1; locale=zh-CN; lark_oapi_csrf_token=y9P4dTvaazsKWr59VHNU2f9dUeham+H+4Ic1OZuazn8=; session=XN0YXJ0-b79p4042-b63a-429a-825e-4dc5a2b46a0a-WVuZA; session_list=XN0YXJ0-b79p4042-b63a-429a-825e-4dc5a2b46a0a-WVuZA_XN0YXJ0-f5bu253f-9230-46ce-b7c0-4c8aa25df4d9-WVuZA_XN0YXJ0-b79p4042-b63a-429a-825e-4dc5a2b46a0a-WVuZA; login_recently=1; passport_app_access_token=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDU0MjI5NTEsInVuaXQiOiJldV9uYyIsInJhdyI6eyJtX2FjY2Vzc19pbmZvIjp7IjciOnsiaWF0IjoxNzA1Mzc5NzUxLCJhY2Nlc3MiOnRydWV9fSwic3VtIjoiMDIwOWI3ZGRlMjQ2MjE5ODk2NzVjNTM3MmQ0Zjg1OTY0MWE2ZWNiNmVjYWI2NThiMDg1Mzg4NzBkYmNmY2Q0MyJ9fQ.DYJ1m-Br9KmPkG-NZz_WVKjL2u_pzP4Kk-FzSoifWmAnnT2iPWatwPgSbIZfe_MxVwksJzxlv4Vz_MfqOa6aTA; sl_session=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDU0MjQ0MzksInVuaXQiOiJldV9uYyIsInJhdyI6eyJtZXRhIjoiQVdNaEtOcllBQUFFWXlFb3gxY1NnQVJqSVNpZ2ZZRkFBV01oS0tCOWdVQUJaRXR3c0t0REFBUUNLZ0VBUVVGQlFVRkJRVUZCUVVKc2J6aHNNM2ROUWtGSVFUMDkiLCJzdW0iOiIwMjA5YjdkZGUyNDYyMTk4OTY3NWM1MzcyZDRmODU5NjQxYTZlY2I2ZWNhYjY1OGIwODUzODg3MGRiY2ZjZDQzIiwibG9jIjoiemhfY24iLCJhcGMiOiJSZWxlYXNlIiwiaWF0IjoxNzA1MzgxMjM5LCJzYWMiOnsiVXNlclN0YWZmU3RhdHVzIjoiMSIsIlVzZXJUeXBlIjoiNDIifSwibG9kIjpudWxsLCJucyI6ImxhcmsiLCJuc191aWQiOiI3MTQzMDM1NDA0Mzc4MTc3NTQwIiwibnNfdGlkIjoiNzE0MzAzNTMyMDYxMDc1MDQ2OCIsIm90IjozfX0.w5JFuk0SRWw513zigiyBqNp-02iMJNPLZIwvtNyF6552wFRQDAJSM8E57Qt63EPD4c4B1w2z424UZFR_9jLCLw; swp_csrf_token=4253bb9c-616f-4c3d-a98b-bbbae33fae8a; t_beda37=551c0cce54fc5d3a8d14c48e4beca672f319df5a28adabe1fdcb41a86b582714; _gat_UA-98246768-7=1; _ga=GA1.1.1721306984.1662970809; _ga_VPYRHN104D=GS1.1.1705379570.353.1.1705381474.58.0.0'
  it('should formate cookies str', () => {
    const cookieObj = FormatCookie(mockCookies)
    expect(cookieObj).toBeDefined()
    console.log(cookieObj)
    expect(cookieObj.length).toBeGreaterThan(3)
  })

  it('should filter cookie', () => {
    const cookieObn = FormatCookie(mockCookies)
    const targetCookie = FilterCookie(cookieObn)
    expect(targetCookie).toEqual(
      {
        lark_oapi_csrf_token: 'y9P4dTvaazsKWr59VHNU2f9dUeham+H+4Ic1OZuazn8',
        session: 'XN0YXJ0-b79p4042-b63a-429a-825e-4dc5a2b46a0a-WVuZA',
      },
    )
  })
})

const cheerio = require('cheerio')

exports.route = {

  /**
   * GET /api/gpa
   * 成绩查询
   **/
  async get() {
    await this.useAuthCookie()
    let { cardnum, password } = this.user
    let res = (await this.get('https://boss.myseu.cn/jwccaptcha/')).data

    // 从验证码解析系统获取一次性 Cookie 和解析后的验证码
    let { cookies, captcha } = res
    this.cookieJar.setCookieSync(cookies, 'http://xk.urp.seu.edu.cn/', {})

    await this.post(
      'http://xk.urp.seu.edu.cn/studentService/system/login.action',
      { userName: cardnum, password, vercode: captcha }
    )

    res = await this.get(
      'http://xk.urp.seu.edu.cn/studentService/cs/stuServe/studentExamResultQuery.action'
    )
    let $ = cheerio.load(res.data)
    let detail = $('#table2 tr').toArray().slice(1).map(tr => {
      let [semester, courseId, course, credit, score, scoreType, courseType]
        = $(tr).find('td').toArray().slice(1).map(td => {
          return $(td).text().trim().replace(/&[0-9A-Za-z];/g, '')
        })

      // 学分解析为浮点数；成绩可能为中文，不作解析
      credit = parseFloat(credit)
      return {semester, courseId, course, courseType, credit, score, scoreType}
    })

    let [gpa, gpaNoRevamp, year, calculationTime]
      = $('#table4 tr').eq(1).find('td').toArray().map(td => {
      return $(td).text().trim().replace(/&[0-9A-Za-z];/g, '')
    })

    // 时间解析为时间戳
    calculationTime = new Date(calculationTime).getTime()
    return { gpa, gpaNoRevamp, year, calculationTime, detail }
  }
}

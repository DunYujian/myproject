(function (root) {
  "use strict";
  var formatter;
  try {
    formatter = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", { year: "numeric", month: "long", day: "numeric" });
    if (formatter.resolvedOptions().calendar !== "chinese") formatter = null;
  } catch (error) { formatter = null; }
  var numbers = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  var solar = { "1-1": "元旦", "2-14": "情人节", "3-8": "妇女节", "3-12": "植树节", "5-1": "劳动节", "5-4": "青年节", "6-1": "儿童节", "8-1": "建军节", "9-10": "教师节", "10-1": "国庆节", "12-24": "平安夜", "12-25": "圣诞节" };
  var traditional = { "正月-1": "春节", "正月-15": "元宵节", "二月-2": "龙抬头", "五月-5": "端午节", "七月-7": "七夕", "七月-15": "中元节", "八月-15": "中秋节", "九月-9": "重阳节", "腊月-8": "腊八节", "十二月-8": "腊八节" };
  // Qingming dates verified against the HKO Gregorian–lunar conversion tables.
  var qingming = { 2025: 4, 2026: 5, 2027: 5, 2028: 4 };
  function key(date) { return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0"); }
  function lunarDay(day) {
    if (day < 11) return "初" + numbers[day - 1];
    if (day < 20) return "十" + numbers[day - 11];
    if (day === 20) return "二十";
    if (day < 30) return "廿" + numbers[day - 21];
    return "三十";
  }
  function lunar(date) {
    if (!formatter) return null;
    var values = {};
    formatter.formatToParts(date).forEach(function (part) { values[part.type] = part.value; });
    var day = Number(values.day), year = Number(values.relatedYear);
    if (!day || !values.month || !year) return null;
    var zodiac = "鼠牛虎兔龙蛇马羊猴鸡狗猪"[(year - 4 + 12000) % 12];
    return { month: values.month, day: day, dayText: lunarDay(day), year: year, yearText: (values.yearName || year) + "年 · " + zodiac + "年", leap: values.month.includes("闰") };
  }
  function info(date) {
    var value = lunar(date), events = [];
    var fixed = solar[(date.getMonth() + 1) + "-" + date.getDate()];
    if (fixed) events.push(fixed);
    if (date.getMonth() === 3 && qingming[date.getFullYear()] === date.getDate()) events.push("清明节");
    if (date.getDay() === 0 && date.getMonth() === 4 && date.getDate() >= 8 && date.getDate() <= 14) events.push("母亲节");
    if (date.getDay() === 0 && date.getMonth() === 5 && date.getDate() >= 15 && date.getDate() <= 21) events.push("父亲节");
    if (value && !value.leap) {
      var festival = traditional[value.month + "-" + value.day];
      if (festival) events.push(festival);
      if ((value.month === "腊月" || value.month === "十二月") && value.day >= 29) {
        var next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 12);
        var following = lunar(next);
        if (following && following.month === "正月" && following.day === 1) events.push("除夕");
      }
    }
    return { key: key(date), lunar: value, events: events };
  }
  var api = { info: info, key: key };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ZaiyeCalendar = api;
})(typeof window === "object" ? window : globalThis);

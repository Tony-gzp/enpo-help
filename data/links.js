/* ==========================================================================
 * links.js —— 校内常用网站 + 图标库
 * ----------------------------------------------------------------------------
 * 这个文件由 tools/parse-xlsx.py 根据 Excel 表格自动生成。
 * 想改内容有两种方式：
 *   1）改 Excel 表格后重新运行 python tools/parse-xlsx.py
 *   2）直接改这个文件（注意保持 JSON 的格式：引号、逗号）
 *   3）登录网站后台，在「内容编辑」里改（改完立即对所有人生效）
 * ========================================================================== */
window.ENPO_DATA = window.ENPO_DATA || {};

ENPO_DATA.links = {
  "intro": "把能动本科生日常真正会用到的校内网站集中在这里，省得每次翻收藏夹。所有链接都会在新标签页打开。",
  "note": "本站只提供跳转入口，这些网站的内容由学校各相关单位负责，与本站无关。标注了「需要校园网」的网站，在校外请先连接 WebVPN。",
  "groups": [
    {
      "name": "学校主页与新闻",
      "icon": "🌐",
      "items": [
        {
          "name": "西安交通大学官网",
          "url": "http://www.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "🌐"
        },
        {
          "name": "西安交通大学新闻网",
          "url": "https://news.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "📰"
        }
      ]
    },
    {
      "name": "教务与学籍",
      "icon": "📘",
      "items": [
        {
          "name": "迎新注册离校系统",
          "url": "http://hello.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "🎒"
        },
        {
          "name": "西安交通大学本科教务",
          "url": "http://ehall.xjtu.edu.cn/\n \nhttp://jwxt.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "两个网站均可",
          "icon": "🖥️"
        },
        {
          "name": "西安交通大学教务处",
          "url": "http://due.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "与本科教务不同，该网站主要是查看通知",
          "icon": "📘"
        },
        {
          "name": "选课系统",
          "url": "http://xkfw.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "🗳️"
        },
        {
          "name": "学生成长支持系统",
          "url": "http://ss.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "🌱"
        },
        {
          "name": "考勤查询",
          "url": "http://kq.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "只可以在校园网环境下进入，或连接WebVPN",
          "icon": "⏱️"
        }
      ]
    },
    {
      "name": "学习平台",
      "icon": "💻",
      "items": [
        {
          "name": "思源学堂",
          "url": "http://syxt.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "📖"
        },
        {
          "name": "教师主页门户",
          "url": "https://gr.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "👤"
        },
        {
          "name": "西安交通大学网络教学平台",
          "url": "https://xjtu.fanya.chaoxing.com/portal",
          "altUrls": [],
          "desc": "",
          "icon": "🎬"
        }
      ]
    },
    {
      "name": "图书馆与学术",
      "icon": "📚",
      "items": [
        {
          "name": "图书馆官网",
          "url": "https://www.lib.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "部分功能只能在校园网环境下使用，或连接WebVPN",
          "icon": "📚"
        },
        {
          "name": "学术资源平台",
          "url": "https://meeting.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "🎓"
        }
      ]
    },
    {
      "name": "学院与书院",
      "icon": "🏫",
      "items": [
        {
          "name": "彭康书院官网",
          "url": "https://pksy.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "🏠"
        },
        {
          "name": "能动学院官网",
          "url": "https://epe.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "⚙️"
        },
        {
          "name": "核科学与技术学院官网",
          "url": "https://nuclear.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "☢️"
        },
        {
          "name": "能动学院国家级实验教学示范中心",
          "url": "https://sfnd.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "🧪"
        }
      ]
    },
    {
      "name": "实践与毕业",
      "icon": "🎯",
      "items": [
        {
          "name": "毕业设计（论文）管理系统",
          "url": "http://pts.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "只可以在校园网环境下进入，或连接WebVPN",
          "icon": "🎯"
        },
        {
          "name": "专业实习管理系统",
          "url": "http://pts.xjtu.edu.cn/sx/Index.aspx",
          "altUrls": [],
          "desc": "只可以在校园网环境下进入，或连接WebVPN",
          "icon": "🛠️"
        },
        {
          "name": "研究生信息管理系统",
          "url": "https://gmis.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "🔬"
        }
      ]
    },
    {
      "name": "校园生活与服务",
      "icon": "🏢",
      "items": [
        {
          "name": "学生邮件系统",
          "url": "http://stu.xjtu.edu.cn/coremail/",
          "altUrls": [],
          "desc": "",
          "icon": "✉️"
        },
        {
          "name": "西安交通大学WebVPN",
          "url": "http://webvpn.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "需要申请后才可使用",
          "icon": "🔐"
        },
        {
          "name": "校医院",
          "url": "http://www.collegian-health.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "🏥"
        },
        {
          "name": "西安交通大学学生处",
          "url": "http://xsc.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "🎓"
        },
        {
          "name": "西安交通大学财务处",
          "url": "http://jdcw.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "💰"
        },
        {
          "name": "网络信息中心",
          "url": "http://nic.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "部分功能只能在校园网环境下使用，或连接WebVPN",
          "icon": "📡"
        },
        {
          "name": "保卫处",
          "url": "https://bw.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "🛡️"
        },
        {
          "name": "实验室管理处",
          "url": "http://www.dpm.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "⚗️"
        },
        {
          "name": "后勤保障部",
          "url": "https://hq.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "🍚"
        },
        {
          "name": "心理健康服务平台",
          "url": "https://yzxlcs.xjtu.edu.cn/",
          "altUrls": [],
          "desc": "",
          "icon": "💚"
        }
      ]
    }
  ]
};

ENPO_DATA.iconSet = [
  {
    "group": "学校与学院",
    "icons": [
      "🌐",
      "🏫",
      "🎓",
      "🏛️",
      "⚙️",
      "☢️",
      "🧪",
      "🏠",
      "📰",
      "🎒",
      "🌱",
      "👤"
    ]
  },
  {
    "group": "学习与教务",
    "icons": [
      "📘",
      "📗",
      "📙",
      "📕",
      "📚",
      "📖",
      "✏️",
      "📝",
      "🗳️",
      "🖥️",
      "💻",
      "🎬"
    ]
  },
  {
    "group": "成绩与实践",
    "icons": [
      "📊",
      "📈",
      "🏅",
      "🎯",
      "🛠️",
      "🔬",
      "⚗️",
      "🧰",
      "📐",
      "🧮"
    ]
  },
  {
    "group": "服务与生活",
    "icons": [
      "✉️",
      "📮",
      "📡",
      "🔐",
      "🔑",
      "🏥",
      "💰",
      "🛡️",
      "🍚",
      "🏢",
      "🚌",
      "💚"
    ]
  },
  {
    "group": "常用符号",
    "icons": [
      "🔗",
      "📌",
      "⭐",
      "✅",
      "ℹ️",
      "🆘",
      "📅",
      "⏱️",
      "🧭",
      "☎️",
      "📢",
      "🗂️"
    ]
  }
];

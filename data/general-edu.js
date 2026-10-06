/* ==========================================================================
 * general-edu.js —— 能动学院必选通识课
 * ----------------------------------------------------------------------------
 * 这个文件由 tools/parse-xlsx.py 根据 Excel 表格自动生成。
 * 想改内容有两种方式：
 *   1）改 Excel 表格后重新运行 python tools/parse-xlsx.py
 *   2）直接改这个文件（注意保持 JSON 的格式：引号、逗号）
 *   3）登录网站后台，在「内容编辑」里改（改完立即对所有人生效）
 * ========================================================================== */
window.ENPO_DATA = window.ENPO_DATA || {};

ENPO_DATA.generalEdu = {
  "title": "能动学院必选通识课",
  "intro": "这里汇总能动学院同学需要修读的通识课程：学分要求、模块要求，以及各个模块下有哪些课程可以选。",
  "rules": [
    {
      "label": "通识类核心课",
      "value": "6 学分",
      "note": "课程代码以 CORE 开头"
    },
    {
      "label": "通识类选修课",
      "value": "6 学分",
      "note": "课程代码以 GNED 开头"
    },
    {
      "label": "修读模块数",
      "value": "不少于 3 个模块",
      "note": "全部通识课程合计"
    },
    {
      "label": "单个模块上限",
      "value": "不超过 2 门课",
      "note": "每个模块内单独计算"
    },
    {
      "label": "完成时间",
      "value": "本科四年内修完",
      "note": "不要求在一个学期内学完"
    }
  ],
  "map": {
    "root": "能动学院必选通识课",
    "notes": [
      "除必选要求外，四年内必须修完：通识类核心课 6 学分 + 通识类选修课 6 学分",
      "全部通识课程修读不得少于 3 个模块",
      "每个模块内修读不得超过 2 门课程"
    ],
    "branches": [
      {
        "title": "学校要求",
        "icon": "🏫",
        "children": [
          {
            "title": "文化传承与艺术审美",
            "value": "最少 1 门，不限学分",
            "icon": "🎨"
          },
          {
            "title": "经典导读与学术写作",
            "value": "最少 1 门，不限学分",
            "icon": "📜"
          },
          {
            "title": "创新创业类",
            "value": "2 学分",
            "icon": "💡",
            "children": [
              {
                "title": "在通识课的「哲学智慧与创新思维」模块修 2 学分"
              },
              {
                "title": "在专业选修课中选择相关课程，修 2 学分"
              }
            ]
          }
        ]
      },
      {
        "title": "学院要求",
        "icon": "⚙️",
        "children": [
          {
            "title": "对于能动（含越杰）、新能源、环境工程、储能",
            "icon": "🔧",
            "children": [
              {
                "title": "工程伦理类",
                "value": "2 学分"
              },
              {
                "title": "经济管理类",
                "value": "2 学分"
              }
            ]
          },
          {
            "title": "对于核",
            "icon": "☢️",
            "children": [
              {
                "title": "工程伦理类",
                "value": "2 学分"
              },
              {
                "title": "工程经济学类",
                "value": "2 学分"
              },
              {
                "title": "项目管理类",
                "value": "2 学分"
              }
            ]
          }
        ]
      }
    ]
  },
  "modules": [
    {
      "name": "文化传承与艺术审美",
      "icon": "🎨",
      "audience": "学校要求：所有专业最少选 1 门",
      "credits": "不限学分",
      "unrestricted": false,
      "colleges": [],
      "courses": [],
      "emptyHint": "具体课程清单请到本科教务系统（ehall.xjtu.edu.cn）的「全校方案查询」里查看，只要课程属于「文化传承与艺术审美」模块即可。"
    },
    {
      "name": "经典导读与学术写作",
      "icon": "📜",
      "audience": "学校要求：所有专业最少选 1 门",
      "credits": "不限学分",
      "unrestricted": false,
      "colleges": [],
      "courses": [],
      "emptyHint": "具体课程清单请到本科教务系统（ehall.xjtu.edu.cn）的「全校方案查询」里查看，只要课程属于「经典导读与学术写作」模块即可。"
    },
    {
      "name": "工程伦理类课程",
      "icon": "⚖️",
      "audience": "所有专业（含核）均需修读 2 学分",
      "credits": "2",
      "unrestricted": false,
      "colleges": [],
      "courses": [
        {
          "code": "CORE100303",
          "name": "科学技术与工程伦理",
          "credits": "2",
          "college": "能源与动力工程学院",
          "kind": "核心课",
          "note": ""
        },
        {
          "code": "GNED106004",
          "name": "前沿科技与伦理反思",
          "credits": "2",
          "college": "电气工程学院",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED101827",
          "name": "数字化社会的工程科技与伦理道德",
          "credits": "2",
          "college": "电信学部",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "CORE100701",
          "name": "工程实践与伦理",
          "credits": "2",
          "college": "机械工程学院",
          "kind": "核心课",
          "note": ""
        },
        {
          "code": "GNED106018",
          "name": "人工智能与伦理",
          "credits": "2",
          "college": "公共政策与管理学院",
          "kind": "选修课",
          "note": ""
        }
      ]
    },
    {
      "name": "项目管理类课程（核）",
      "icon": "📋",
      "audience": "仅核工程与核技术相关专业需要",
      "credits": "2",
      "unrestricted": false,
      "colleges": [],
      "courses": [
        {
          "code": "GNED107703",
          "name": "项目管理理论与实践",
          "credits": "2",
          "college": "能源与动力工程学院",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED100401",
          "name": "项目管理",
          "credits": "2",
          "college": "机械工程学院",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED106904",
          "name": "项目管理概论",
          "credits": "2",
          "college": "电气工程学院",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED101127",
          "name": "系统工程与项目管理",
          "credits": "2",
          "college": "电信学部",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED101327",
          "name": "工程项目管理",
          "credits": "2",
          "college": "电信学部",
          "kind": "选修课",
          "note": ""
        }
      ]
    },
    {
      "name": "工程经济学类课程（核）",
      "icon": "📈",
      "audience": "仅核工程与核技术相关专业需要",
      "credits": "2",
      "unrestricted": false,
      "colleges": [],
      "courses": [
        {
          "code": "GNED107903",
          "name": "能源工程经济学",
          "credits": "2",
          "college": "能源与动力工程学院",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED100608",
          "name": "工程经济学",
          "credits": "2",
          "college": "管理学院",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED108203",
          "name": "低碳能源转化技术与工程经济管理",
          "credits": "2",
          "college": "能源与动力工程学院",
          "kind": "选修课",
          "note": ""
        }
      ]
    },
    {
      "name": "经济管理类课程（除核之外）",
      "icon": "💼",
      "audience": "",
      "credits": "2",
      "unrestricted": true,
      "colleges": [
        "公共政策与管理学院",
        "管理学院",
        "经济与金融学院",
        "金禾经济研究中心"
      ],
      "courses": []
    },
    {
      "name": "创新创业类课程",
      "icon": "💡",
      "audience": "所有专业均需修读 2 学分",
      "credits": "2",
      "unrestricted": false,
      "colleges": [],
      "courses": [
        {
          "code": "CORE102600",
          "name": "创新思维和机器人创客实践",
          "credits": "2",
          "college": "",
          "kind": "核心课",
          "note": ""
        },
        {
          "code": "CORE100405",
          "name": "大数据思维与科学创新",
          "credits": "2",
          "college": "",
          "kind": "核心课",
          "note": ""
        },
        {
          "code": "CORE102403",
          "name": "科学技术创新思维与工程实践",
          "credits": "2",
          "college": "",
          "kind": "核心课",
          "note": ""
        },
        {
          "code": "CORE102305",
          "name": "基于“互联网+”背景的创业基础",
          "credits": "2",
          "college": "",
          "kind": "核心课",
          "note": ""
        },
        {
          "code": "CORE102203",
          "name": "再创式学习方法与技术创新训练",
          "credits": "2",
          "college": "",
          "kind": "核心课",
          "note": ""
        },
        {
          "code": "GNED106392",
          "name": "大学生职业发展与规划",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": "自 2026-2027 学年第 1 学期起，这门课不再计入创新创业类选修课，不能再用来抵这 2 学分。此前已经选过并取得成绩的仍然有效。",
          "disabled": true
        },
        {
          "code": "GNED106803",
          "name": "创新思维与创新能力自培养",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED106292",
          "name": "大学生创业训练与实践",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED106104",
          "name": "等离子体与科技创新",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED106204",
          "name": "以创新创业大赛为核心的创新创业实践",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED100908",
          "name": "创业学：从0到1",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED100808",
          "name": "创业管理与实践模拟",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED100609",
          "name": "物理建模与创新实践",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED100601",
          "name": "面向创业的机电产品创新设计",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED100408",
          "name": "创新与创业管理",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED113910",
          "name": "学习与创新",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED100116",
          "name": "工程思维与创新",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED100152",
          "name": "电子创新与创客实践",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED100801",
          "name": "走进机器人：项目驱动的创新与实践",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED100302",
          "name": "多学科交叉创新与自主创业实践",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED100252",
          "name": "机器人创意设计与实践",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED100201",
          "name": "设计思维Ⅰ",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED107603",
          "name": "设计思维Ⅱ",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED101248",
          "name": "设计思维Ⅲ",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED101627",
          "name": "硅谷创新简史",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED101322",
          "name": "结构设计思维与实践",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED101108",
          "name": "系统创新方法",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        },
        {
          "code": "GNED106804",
          "name": "微纳米系统：技术、产业与创业",
          "credits": "2",
          "college": "",
          "kind": "选修课",
          "note": ""
        }
      ]
    }
  ],
  "source": {
    "label": "本科教务系统（全校方案查询）",
    "url": "https://ehall.xjtu.edu.cn"
  },
  "note": "以上课程清单来自学长学姐整理的表格，可能随培养方案调整而变化。选课前请务必到本科教务系统核对当学期实际开课情况。"
};

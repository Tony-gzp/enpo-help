/* ==========================================================================
 * plans.js —— 2026 / 2025 / 2024 级培养方案与教材
 * ----------------------------------------------------------------------------
 * 这个文件由 tools/parse-xlsx.py 根据 Excel 表格自动生成。
 * 想改内容有两种方式：
 *   1）改 Excel 表格后重新运行 python tools/parse-xlsx.py
 *   2）直接改这个文件（注意保持 JSON 的格式：引号、逗号）
 *   3）登录网站后台，在「内容编辑」里改（改完立即对所有人生效）
 * ========================================================================== */
window.ENPO_DATA = window.ENPO_DATA || {};

ENPO_DATA.plans = {
  "order": [
    "2026",
    "2025",
    "2024"
  ],
  "years": {
    "2026": {
      "label": "2026 级",
      "title": "2026 级本科生培养方案与所需教材",
      "intro": "2026 级入学，本页为该年级**大一**两个学期的课程与教材。大一的教材无论模块和方向都是相同的。",
      "terms": [
        {
          "name": "大一上",
          "remark": "（备注：大一的教材无论模块和方向，都是一样的）",
          "groups": [
            {
              "name": "2026级能动类、新能源、环境工程、能动国卓、能动强基、中核英才",
              "note": "",
              "courses": [
                {
                  "code": "ENGL202812",
                  "name": "大学英语Ⅰ",
                  "credits": "2",
                  "requirement": "三选一必修",
                  "note": "A班：通用学术英语\nB班：大学英语Ⅰ\nC班：大学英语Ⅱ",
                  "books": [
                    {
                      "title": "新标准大学英语综合教程2（智慧版）\n新标准大学英语视听说教程2",
                      "author": "Simon Greenall，文秋芳",
                      "edition": "3",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL202912",
                  "name": "大学英语Ⅱ",
                  "credits": "2",
                  "requirement": "三选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "新世界交互英语.读写译学生用书.1",
                      "author": "庄智象总主编；毛立群主编",
                      "edition": "2",
                      "publisher": "清华大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203012",
                  "name": "通用学术英语",
                  "credits": "2",
                  "requirement": "三选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "通用学术英语",
                      "author": "王芳 钱希",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MACH390801",
                  "name": "机械制图",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "看自己班老师的具体要求\n（两本书其实都可以用）\n重点是看老师要求用哪本练习册！",
                  "books": [
                    {
                      "title": "画法几何及工程制图",
                      "author": "唐克中 郑镁",
                      "edition": "6",
                      "publisher": "高等教育出版社"
                    },
                    {
                      "title": "工程图学与实践",
                      "author": "续丹",
                      "edition": "1",
                      "publisher": "机械工业出版社"
                    }
                  ]
                },
                {
                  "code": "MATH297507",
                  "name": "高等数学II-1",
                  "credits": "6",
                  "requirement": "必修",
                  "note": "MATLAB这本书是数学实验用书",
                  "books": [
                    {
                      "title": "工科数学分析基础（上册）",
                      "author": "马知恩 王绵森",
                      "edition": "4",
                      "publisher": "高等教育出版社"
                    },
                    {
                      "title": "MATLAB软件与基础数学实验",
                      "author": "李换琴 朱旭",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MATH298207",
                  "name": "线性代数与解析几何II",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "线性代数与解析几何",
                      "author": "李继成 魏战线",
                      "edition": "3",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MILI100554",
                  "name": "国防教育",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "国防教育教程",
                      "author": "问鸿滨",
                      "edition": "6",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MILI100654",
                  "name": "军训",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "MLMD101514",
                  "name": "大学生思想文化素养",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "思想道德与法治",
                      "author": "-",
                      "edition": "2023年版",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "PHED109050",
                  "name": "体育-1",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "根据自己体育课的要求而定",
                      "author": "",
                      "edition": "",
                      "publisher": ""
                    }
                  ]
                },
                {
                  "code": "PHED109250",
                  "name": "体育-3",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENPO340603",
                  "name": "能源与动力工程科学技术导论",
                  "credits": "1",
                  "requirement": "必修 要求见备注",
                  "note": "能动类、能动国卓：能动导论与核导论二选一必修\n新能源：能动导论必修\n环境工程：环境导论必修\n能动强基：燃气轮机导论必修\n中核英才：核导论必修",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "NUCL300403",
                  "name": "核科学与技术导论",
                  "credits": "1",
                  "requirement": "必修 要求见备注",
                  "note": "",
                  "books": []
                },
                {
                  "code": "EVNG301003",
                  "name": "环境科学与工程导论",
                  "credits": "1",
                  "requirement": "必修 要求见备注",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENPO342403",
                  "name": "燃气轮机与航空发动机前沿技术导论",
                  "credits": "1",
                  "requirement": "必修 要求见备注",
                  "note": "",
                  "books": []
                }
              ]
            },
            {
              "name": "2026级能源与动力工程（越杰）",
              "note": "",
              "courses": [
                {
                  "code": "ENGL203012",
                  "name": "通用学术英语",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "通用学术英语",
                      "author": "王芳 钱希",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MACH390801",
                  "name": "机械制图",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "看自己班老师的具体要求\n（两本书其实都可以用）\n重点是看老师要求用哪本练习册！",
                  "books": [
                    {
                      "title": "画法几何及工程制图",
                      "author": "唐克中 郑镁",
                      "edition": "6",
                      "publisher": "高等教育出版社"
                    },
                    {
                      "title": "工程图学与实践",
                      "author": "续丹",
                      "edition": "1",
                      "publisher": "机械工业出版社"
                    }
                  ]
                },
                {
                  "code": "MATH297507",
                  "name": "高等数学II-1",
                  "credits": "6",
                  "requirement": "必修",
                  "note": "MATLAB这本书是数学实验用书",
                  "books": [
                    {
                      "title": "工科数学分析基础（上册）",
                      "author": "马知恩 王绵森",
                      "edition": "4",
                      "publisher": "高等教育出版社"
                    },
                    {
                      "title": "MATLAB软件与基础数学实验",
                      "author": "李换琴 朱旭",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MATH298207",
                  "name": "线性代数与解析几何II",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "线性代数与解析几何",
                      "author": "李继成 魏战线",
                      "edition": "3",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MILI100554",
                  "name": "国防教育",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "国防教育教程",
                      "author": "问鸿滨",
                      "edition": "6",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MILI100654",
                  "name": "军训",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "MLMD101514",
                  "name": "大学生思想文化素养",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "思想道德与法治",
                      "author": "-",
                      "edition": "2023年版",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "PHED109050",
                  "name": "体育-1",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "根据自己体育课的要求而定",
                      "author": "",
                      "edition": "",
                      "publisher": ""
                    }
                  ]
                },
                {
                  "code": "PHED109250",
                  "name": "体育-3",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENPO340603",
                  "name": "能源与动力工程科学技术导论",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [],
                  "noBook": true
                }
              ]
            },
            {
              "name": "2026级核工程与核技术（强基计划）",
              "note": "",
              "courses": [
                {
                  "code": "ENGL202812",
                  "name": "大学英语Ⅰ",
                  "credits": "2",
                  "requirement": "三选一必修",
                  "note": "A班：通用学术英语\nB班：大学英语Ⅰ\nC班：大学英语Ⅱ",
                  "books": [
                    {
                      "title": "新标准大学英语综合教程2（智慧版）\n新标准大学英语视听说教程2",
                      "author": "Simon Greenall，文秋芳",
                      "edition": "3",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL202912",
                  "name": "大学英语Ⅱ",
                  "credits": "2",
                  "requirement": "三选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "新世界交互英语.读写译学生用书.1",
                      "author": "庄智象总主编；毛立群主编",
                      "edition": "2",
                      "publisher": "清华大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203012",
                  "name": "通用学术英语",
                  "credits": "2",
                  "requirement": "三选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "通用学术英语",
                      "author": "王芳 钱希",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MACH391201",
                  "name": "工程图学",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "MATH297507",
                  "name": "高等数学II-1",
                  "credits": "6",
                  "requirement": "必修",
                  "note": "MATLAB这本书是数学实验用书",
                  "books": [
                    {
                      "title": "工科数学分析基础（上册）",
                      "author": "马知恩 王绵森",
                      "edition": "4",
                      "publisher": "高等教育出版社"
                    },
                    {
                      "title": "MATLAB软件与基础数学实验",
                      "author": "李换琴 朱旭",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MATH298207",
                  "name": "线性代数与解析几何II",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "线性代数与解析几何",
                      "author": "李继成 魏战线",
                      "edition": "3",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MILI100554",
                  "name": "国防教育",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "国防教育教程",
                      "author": "问鸿滨",
                      "edition": "6",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MILI100654",
                  "name": "军训",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "MLMD101514",
                  "name": "大学生思想文化素养",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "思想道德与法治",
                      "author": "-",
                      "edition": "2023年版",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "PHED109050",
                  "name": "体育-1",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "根据自己体育课的要求而定",
                      "author": "",
                      "edition": "",
                      "publisher": ""
                    }
                  ]
                },
                {
                  "code": "PHED109250",
                  "name": "体育-3",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "NUCL300403",
                  "name": "核科学与技术导论",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [],
                  "noBook": true
                }
              ]
            }
          ]
        },
        {
          "name": "大一下",
          "remark": "（备注：大一的教材无论模块和方向，都是一样的）",
          "groups": [
            {
              "name": "2026级能动类、新能源、环境工程、能动国卓、能动强基、中核英才",
              "note": "",
              "courses": [
                {
                  "code": "ENGL201312",
                  "name": "西方礼仪文化",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201512",
                  "name": "欧洲文化渊源",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201612",
                  "name": "人文英语阅读",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201912",
                  "name": "美国文化",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202112",
                  "name": "商务英语",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202212",
                  "name": "新闻英语阅读",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "2025级教材，2026级暂时未知",
                  "books": [
                    {
                      "title": "新闻英语阅读教程",
                      "author": "黄奕 卢燕华",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL202312",
                  "name": "英语辩论",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202412",
                  "name": "英语电影视听说",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202712",
                  "name": "理解当代中国：英语演讲",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203112",
                  "name": "英语学术论文写作",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203212",
                  "name": "中级英语写作",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203312",
                  "name": "中国文化翻译",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203412",
                  "name": "阅读与思辨",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203512",
                  "name": "英语写作基础",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203612",
                  "name": "雅思写作",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "2025级教材，2026级暂时未知",
                  "books": [
                    {
                      "title": "雅思写作实践教程",
                      "author": "王东",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203712",
                  "name": "沟通与文化交流",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "2025级教材，2026级暂时未知",
                  "books": [
                    {
                      "title": "跨文化交际：中英文化对比",
                      "author": "张桂萍",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203812",
                  "name": "雅思口语",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203912",
                  "name": "TED英语视听说Ⅰ",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204012",
                  "name": "TED英语视听说Ⅱ",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204112",
                  "name": "医学英语视听说",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204412",
                  "name": "新一代大学英语",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204512",
                  "name": "医学英语阅读",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204612",
                  "name": "医学英语术语",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205012",
                  "name": "国际学术交流英语",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205212",
                  "name": "国际人才英语",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205312",
                  "name": "医学英语写作",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL207212",
                  "name": "理解当代中国：英语读写",
                  "credits": "2",
                  "requirement": "27选1必修",
                  "note": "2025级教材，2026级暂时未知",
                  "books": [
                    {
                      "title": "《理解当代中国》大学英语综合教程2",
                      "author": "孙有中 何莲玲",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO200303",
                  "name": "大学计算机 -工程算法编程",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "2025级教材，2026级暂时未知",
                  "books": [
                    {
                      "title": "工程分析程序设计",
                      "author": "陈斌 魏进家 刘小民 周屈兰",
                      "edition": "2",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MATH297807",
                  "name": "高等数学Ⅱ-2",
                  "credits": "6",
                  "requirement": "必修",
                  "note": "2025级教材，2026级暂时未知",
                  "books": [
                    {
                      "title": "工科数学分析基础（下册）",
                      "author": "马知恩 王绵森",
                      "edition": "4",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MLMD191214",
                  "name": "中国共产党历史与理论",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED109150",
                  "name": "体育-2",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "根据自己体育课的要求而定",
                      "author": "",
                      "edition": "",
                      "publisher": ""
                    }
                  ]
                },
                {
                  "code": "PHED109350",
                  "name": "体育-4",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHYS281509",
                  "name": "大学物理Ⅱ-1",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "2025级教材，2026级暂时未知\n两本教材内容完全一样，任选其一即可",
                  "books": [
                    {
                      "title": "大学物理学（上册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    },
                    {
                      "title": "大学物理（新版) (上册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "PHYS281809",
                  "name": "大学物理实验Ⅰ-1",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "2025级教材，2026级暂时未知",
                  "books": [
                    {
                      "title": "大学物理实验",
                      "author": "高博 张沛 张俊武 王红理",
                      "edition": "3",
                      "publisher": "高等教育出版社"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      "source": {
        "label": "本科教务系统 · 全校方案查询",
        "url": "https://ehall.xjtu.edu.cn"
      },
      "note": "本页内容由学长学姐根据教务系统整理，教材版次可能随任课教师要求变化。选课前请先确认任课教师指定的版本，再决定买新书还是二手书。"
    },
    "2025": {
      "label": "2025 级",
      "title": "2025 级本科生培养方案与所需教材",
      "intro": "2025 级同学已进入大二，本页为该年级**大二**两个学期的课程与教材，按「能动 A/B/C/D 模块」和「核工程 A/B/C 模块」分别列出。",
      "terms": [
        {
          "name": "大二上",
          "remark": "",
          "groups": [
            {
              "name": "2025级能源与动力工程A、B、C、D模块",
              "note": "",
              "courses": [
                {
                  "code": "CHEM249809",
                  "name": "大学化学",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学化学",
                      "author": "张志成",
                      "edition": "2",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "CHEM249909",
                  "name": "大学化学实验",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学化学实验",
                      "author": "郑阿群 孙杨",
                      "edition": "1",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL201312",
                  "name": "西方礼仪文化",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201512",
                  "name": "欧洲文化渊源",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "欧洲文化渊源教程",
                      "author": "刘浩 黄奕",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL201612",
                  "name": "人文英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201912",
                  "name": "美国文化",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202112",
                  "name": "商务英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202212",
                  "name": "新闻英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "新闻英语阅读教程",
                      "author": "黄奕 卢燕华",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL202312",
                  "name": "英语辩论",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202412",
                  "name": "英语电影视听说",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202712",
                  "name": "理解当代中国：英语演讲",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "《理解当代中国》英语演讲教程",
                      "author": "金利民",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203112",
                  "name": "英语学术论文写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203212",
                  "name": "中级英语写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203312",
                  "name": "中国文化翻译",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203412",
                  "name": "阅读与思辨",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203612",
                  "name": "雅思写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "雅思写作实践教程",
                      "author": "王东",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203712",
                  "name": "沟通与文化交流",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "2024级教材，2025级暂时未知",
                  "books": [
                    {
                      "title": "跨文化交际：中英文化对比",
                      "author": "张桂萍",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203812",
                  "name": "雅思口语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204012",
                  "name": "TED英语视听说Ⅱ",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204112",
                  "name": "医学英语视听说",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204512",
                  "name": "医学英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204612",
                  "name": "医学英语术语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205012",
                  "name": "国际学术交流英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "国际学术交流英语",
                      "author": "邵娟 孙燕",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL205212",
                  "name": "国际人才英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205312",
                  "name": "医学英语写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL207212",
                  "name": "理解当代中国：英语读写",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "2024级教材，2025级暂时未知",
                  "books": [
                    {
                      "title": "《理解当代中国》大学英语综合教程2",
                      "author": "孙有中 何莲玲",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "MATH295507",
                  "name": "概率论与数理统计",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "概率论与数理统计",
                      "author": "赵小艳 施雨 李耀武 段启宏",
                      "edition": "2",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MCRA200152",
                  "name": "测控实习",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "测控基础实训教程",
                      "author": "张育林 王娜 黄宝娟",
                      "edition": "3",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MECH311506",
                  "name": "工程力学Ⅰ",
                  "credits": "3.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "工程力学",
                      "author": "杨庆生",
                      "edition": "3",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "MLMD193514",
                  "name": "毛泽东思想和中国特色社会主义理论体系概论",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "毛泽东思想和中国特色社会主义理论体系概论",
                      "author": "-",
                      "edition": "2023年版",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "PHED109050",
                  "name": "体育-1",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "根据自己体育课的要求而定",
                      "author": "",
                      "edition": "",
                      "publisher": ""
                    }
                  ]
                },
                {
                  "code": "PHED109250",
                  "name": "体育-3",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHYS281609",
                  "name": "大学物理Ⅱ-2",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "两本教材内容完全一样，任选其一即可",
                  "books": [
                    {
                      "title": "大学物理学（下册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    },
                    {
                      "title": "大学物理（新版) (下册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "PHYS281909",
                  "name": "大学物理实验Ⅰ-2",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学物理实验",
                      "author": "高博 张沛 张俊武 王红理",
                      "edition": "3",
                      "publisher": "高等教育出版社"
                    }
                  ]
                }
              ]
            },
            {
              "name": "2025级核工程与核技术A、B、C模块",
              "note": "",
              "courses": [
                {
                  "code": "CHEM249809",
                  "name": "大学化学",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学化学",
                      "author": "张志成",
                      "edition": "2",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "CHEM249909",
                  "name": "大学化学实验",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学化学实验",
                      "author": "郑阿群 孙杨",
                      "edition": "1",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL201312",
                  "name": "西方礼仪文化",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201512",
                  "name": "欧洲文化渊源",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201612",
                  "name": "人文英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201912",
                  "name": "美国文化",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202112",
                  "name": "商务英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202212",
                  "name": "新闻英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "新闻英语阅读教程",
                      "author": "黄奕 卢燕华",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL202312",
                  "name": "英语辩论",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202412",
                  "name": "英语电影视听说",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202712",
                  "name": "理解当代中国：英语演讲",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203112",
                  "name": "英语学术论文写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203212",
                  "name": "中级英语写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203312",
                  "name": "中国文化翻译",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203412",
                  "name": "阅读与思辨",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203612",
                  "name": "雅思写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "雅思写作实践教程",
                      "author": "王东",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203712",
                  "name": "沟通与文化交流",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "2024级教材，2025级暂时未知",
                  "books": [
                    {
                      "title": "跨文化交际：中英文化对比",
                      "author": "张桂萍",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203812",
                  "name": "雅思口语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204012",
                  "name": "TED英语视听说Ⅱ",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204112",
                  "name": "医学英语视听说",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204512",
                  "name": "医学英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204612",
                  "name": "医学英语术语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205012",
                  "name": "国际学术交流英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205212",
                  "name": "国际人才英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205312",
                  "name": "医学英语写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL207212",
                  "name": "理解当代中国：英语读写",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "2024级教材，2025级暂时未知",
                  "books": [
                    {
                      "title": "《理解当代中国》大学英语综合教程2",
                      "author": "孙有中 何莲玲",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "MATH201607",
                  "name": "数学物理方程",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "数学物理方程",
                      "author": "申建忠 刘峰",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MATH295507",
                  "name": "概率论与数理统计",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "概率论与数理统计",
                      "author": "赵小艳 施雨 李耀武 段启宏",
                      "edition": "2",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MCRA200152",
                  "name": "测控实习",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "测控基础实训教程",
                      "author": "张育林 王娜 黄宝娟",
                      "edition": "3",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MECH311506",
                  "name": "工程力学Ⅰ",
                  "credits": "3.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "工程力学",
                      "author": "杨庆生",
                      "edition": "3",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "MLMD193514",
                  "name": "毛泽东思想和中国特色社会主义理论体系概论",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "毛泽东思想和中国特色社会主义理论体系概论",
                      "author": "-",
                      "edition": "2023年版",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "PHED109050",
                  "name": "体育-1",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "根据自己体育课的要求而定",
                      "author": "",
                      "edition": "",
                      "publisher": ""
                    }
                  ]
                },
                {
                  "code": "PHED109250",
                  "name": "体育-3",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHYS281609",
                  "name": "大学物理Ⅱ-2",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "两本教材内容完全一样，任选其一即可",
                  "books": [
                    {
                      "title": "大学物理学（下册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    },
                    {
                      "title": "大学物理（新版) (下册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "PHYS281909",
                  "name": "大学物理实验Ⅰ-2",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学物理实验",
                      "author": "高博 张沛 张俊武 王红理",
                      "edition": "3",
                      "publisher": "高等教育出版社"
                    }
                  ]
                }
              ]
            },
            {
              "name": "2025级核工程与核技术（强基计划）",
              "note": "",
              "courses": [
                {
                  "code": "CHEM249809",
                  "name": "大学化学",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学化学",
                      "author": "张志成",
                      "edition": "2",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "CHEM249909",
                  "name": "大学化学实验",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学化学实验",
                      "author": "郑阿群 孙杨",
                      "edition": "1",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL201312",
                  "name": "西方礼仪文化",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201512",
                  "name": "欧洲文化渊源",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201612",
                  "name": "人文英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201912",
                  "name": "美国文化",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202112",
                  "name": "商务英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202212",
                  "name": "新闻英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "新闻英语阅读教程",
                      "author": "黄奕 卢燕华",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL202312",
                  "name": "英语辩论",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202412",
                  "name": "英语电影视听说",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202712",
                  "name": "理解当代中国：英语演讲",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203112",
                  "name": "英语学术论文写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203212",
                  "name": "中级英语写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203312",
                  "name": "中国文化翻译",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203412",
                  "name": "阅读与思辨",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203612",
                  "name": "雅思写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "雅思写作实践教程",
                      "author": "王东",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203712",
                  "name": "沟通与文化交流",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "2024级教材，2025级暂时未知",
                  "books": [
                    {
                      "title": "跨文化交际：中英文化对比",
                      "author": "张桂萍",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203812",
                  "name": "雅思口语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204012",
                  "name": "TED英语视听说Ⅱ",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204112",
                  "name": "医学英语视听说",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204512",
                  "name": "医学英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204612",
                  "name": "医学英语术语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205012",
                  "name": "国际学术交流英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205212",
                  "name": "国际人才英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205312",
                  "name": "医学英语写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL207212",
                  "name": "理解当代中国：英语读写",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "2024级教材，2025级暂时未知",
                  "books": [
                    {
                      "title": "《理解当代中国》大学英语综合教程2",
                      "author": "孙有中 何莲玲",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "MATH201207",
                  "name": "复变函数",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "MATH201607",
                  "name": "数学物理方程",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "数学物理方程",
                      "author": "申建忠 刘峰",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MATH295507",
                  "name": "概率论与数理统计",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "概率论与数理统计",
                      "author": "赵小艳 施雨 李耀武 段启宏",
                      "edition": "2",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MCRA200152",
                  "name": "测控实习",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "测控基础实训教程",
                      "author": "张育林 王娜 黄宝娟",
                      "edition": "3",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MECH311706",
                  "name": "理论力学",
                  "credits": "3.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "理论力学",
                      "author": "张亚红 刘睫",
                      "edition": "3",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "MECH311906",
                  "name": "基础力学实验-1",
                  "credits": "0.5",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "MLMD193514",
                  "name": "毛泽东思想和中国特色社会主义理论体系概论",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "毛泽东思想和中国特色社会主义理论体系概论",
                      "author": "-",
                      "edition": "2023年版",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "PHED109050",
                  "name": "体育-1",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "根据自己体育课的要求而定",
                      "author": "",
                      "edition": "",
                      "publisher": ""
                    }
                  ]
                },
                {
                  "code": "PHED109250",
                  "name": "体育-3",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHYS281609",
                  "name": "大学物理Ⅱ-2",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "两本教材内容完全一样，任选其一即可",
                  "books": [
                    {
                      "title": "大学物理学（下册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    },
                    {
                      "title": "大学物理（新版) (下册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "PHYS281909",
                  "name": "大学物理实验Ⅰ-2",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学物理实验",
                      "author": "高博 张沛 张俊武 王红理",
                      "edition": "3",
                      "publisher": "高等教育出版社"
                    }
                  ]
                }
              ]
            },
            {
              "name": "2025级新能源科学与工程",
              "note": "",
              "courses": [
                {
                  "code": "CHEM251409",
                  "name": "无机与分析化学",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "CHEM251309",
                  "name": "无机与分析化学实验",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201312",
                  "name": "西方礼仪文化",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201512",
                  "name": "欧洲文化渊源",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201612",
                  "name": "人文英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201912",
                  "name": "美国文化",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202112",
                  "name": "商务英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202212",
                  "name": "新闻英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "新闻英语阅读教程",
                      "author": "黄奕 卢燕华",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL202312",
                  "name": "英语辩论",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202412",
                  "name": "英语电影视听说",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202712",
                  "name": "理解当代中国：英语演讲",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203112",
                  "name": "英语学术论文写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203212",
                  "name": "中级英语写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203312",
                  "name": "中国文化翻译",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203412",
                  "name": "阅读与思辨",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203612",
                  "name": "雅思写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "雅思写作实践教程",
                      "author": "王东",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203712",
                  "name": "沟通与文化交流",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "2024级教材，2025级暂时未知",
                  "books": [
                    {
                      "title": "跨文化交际：中英文化对比",
                      "author": "张桂萍",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203812",
                  "name": "雅思口语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204012",
                  "name": "TED英语视听说Ⅱ",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204112",
                  "name": "医学英语视听说",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204512",
                  "name": "医学英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204612",
                  "name": "医学英语术语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205012",
                  "name": "国际学术交流英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205212",
                  "name": "国际人才英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205312",
                  "name": "医学英语写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL207212",
                  "name": "理解当代中国：英语读写",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "2024级教材，2025级暂时未知",
                  "books": [
                    {
                      "title": "《理解当代中国》大学英语综合教程2",
                      "author": "孙有中 何莲玲",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "MATH295507",
                  "name": "概率论与数理统计",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "概率论与数理统计",
                      "author": "赵小艳 施雨 李耀武 段启宏",
                      "edition": "2",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MCRA200152",
                  "name": "测控实习",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "测控基础实训教程",
                      "author": "张育林 王娜 黄宝娟",
                      "edition": "3",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MECH311506",
                  "name": "工程力学Ⅰ",
                  "credits": "3.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "工程力学",
                      "author": "杨庆生",
                      "edition": "3",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "MLMD193514",
                  "name": "毛泽东思想和中国特色社会主义理论体系概论",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "毛泽东思想和中国特色社会主义理论体系概论",
                      "author": "-",
                      "edition": "2023年版",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "PHED109050",
                  "name": "体育-1",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "根据自己体育课的要求而定",
                      "author": "",
                      "edition": "",
                      "publisher": ""
                    }
                  ]
                },
                {
                  "code": "PHED109250",
                  "name": "体育-3",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHYS281609",
                  "name": "大学物理Ⅱ-2",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "两本教材内容完全一样，任选其一即可",
                  "books": [
                    {
                      "title": "大学物理学（下册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    },
                    {
                      "title": "大学物理（新版) (下册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "PHYS281909",
                  "name": "大学物理实验Ⅰ-2",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学物理实验",
                      "author": "高博 张沛 张俊武 王红理",
                      "edition": "3",
                      "publisher": "高等教育出版社"
                    }
                  ]
                }
              ]
            },
            {
              "name": "2025级能源与动力工程（强基计划）",
              "note": "",
              "courses": [
                {
                  "code": "CHEM249809",
                  "name": "大学化学",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学化学",
                      "author": "张志成",
                      "edition": "2",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "CHEM249909",
                  "name": "大学化学实验",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学化学实验",
                      "author": "郑阿群 孙杨",
                      "edition": "1",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL201312",
                  "name": "西方礼仪文化",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201512",
                  "name": "欧洲文化渊源",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201612",
                  "name": "人文英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201912",
                  "name": "美国文化",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202112",
                  "name": "商务英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202212",
                  "name": "新闻英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "新闻英语阅读教程",
                      "author": "黄奕 卢燕华",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL202312",
                  "name": "英语辩论",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202412",
                  "name": "英语电影视听说",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202712",
                  "name": "理解当代中国：英语演讲",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203112",
                  "name": "英语学术论文写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203212",
                  "name": "中级英语写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203312",
                  "name": "中国文化翻译",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203412",
                  "name": "阅读与思辨",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203612",
                  "name": "雅思写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "雅思写作实践教程",
                      "author": "王东",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203712",
                  "name": "沟通与文化交流",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "2024级教材，2025级暂时未知",
                  "books": [
                    {
                      "title": "跨文化交际：中英文化对比",
                      "author": "张桂萍",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203812",
                  "name": "雅思口语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204012",
                  "name": "TED英语视听说Ⅱ",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204112",
                  "name": "医学英语视听说",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204512",
                  "name": "医学英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204612",
                  "name": "医学英语术语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205012",
                  "name": "国际学术交流英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205212",
                  "name": "国际人才英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205312",
                  "name": "医学英语写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL207212",
                  "name": "理解当代中国：英语读写",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "2024级教材，2025级暂时未知",
                  "books": [
                    {
                      "title": "《理解当代中国》大学英语综合教程2",
                      "author": "孙有中 何莲玲",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "MATH201207",
                  "name": "复变函数",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "MATH201607",
                  "name": "数学物理方程",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "数学物理方程",
                      "author": "申建忠 刘峰",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MATH295507",
                  "name": "概率论与数理统计",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "概率论与数理统计",
                      "author": "赵小艳 施雨 李耀武 段启宏",
                      "edition": "2",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MCRA200152",
                  "name": "测控实习",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "测控基础实训教程",
                      "author": "张育林 王娜 黄宝娟",
                      "edition": "3",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MECH311506",
                  "name": "工程力学Ⅰ",
                  "credits": "3.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "工程力学",
                      "author": "杨庆生",
                      "edition": "3",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "MLMD193514",
                  "name": "毛泽东思想和中国特色社会主义理论体系概论",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "毛泽东思想和中国特色社会主义理论体系概论",
                      "author": "-",
                      "edition": "2023年版",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "PHED109050",
                  "name": "体育-1",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "根据自己体育课的要求而定",
                      "author": "",
                      "edition": "",
                      "publisher": ""
                    }
                  ]
                },
                {
                  "code": "PHED109250",
                  "name": "体育-3",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHYS281609",
                  "name": "大学物理Ⅱ-2",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "两本教材内容完全一样，任选其一即可",
                  "books": [
                    {
                      "title": "大学物理学（下册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    },
                    {
                      "title": "大学物理（新版) (下册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "PHYS281909",
                  "name": "大学物理实验Ⅰ-2",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学物理实验",
                      "author": "高博 张沛 张俊武 王红理",
                      "edition": "3",
                      "publisher": "高等教育出版社"
                    }
                  ]
                }
              ]
            },
            {
              "name": "2025级能源与动力工程（越杰）",
              "note": "",
              "courses": [
                {
                  "code": "CHEM249809",
                  "name": "大学化学",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学化学",
                      "author": "张志成",
                      "edition": "2",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "CHEM249909",
                  "name": "大学化学实验",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学化学实验",
                      "author": "郑阿群 孙杨",
                      "edition": "1",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "MATH295507",
                  "name": "概率论与数理统计",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "概率论与数理统计",
                      "author": "赵小艳 施雨 李耀武 段启宏",
                      "edition": "2",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "MCRA200152",
                  "name": "测控实习",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "测控基础实训教程",
                      "author": "张育林 王娜 黄宝娟",
                      "edition": "3",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MECH311506",
                  "name": "工程力学Ⅰ",
                  "credits": "3.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "工程力学",
                      "author": "杨庆生",
                      "edition": "3",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "MLMD193514",
                  "name": "毛泽东思想和中国特色社会主义理论体系概论",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "毛泽东思想和中国特色社会主义理论体系概论",
                      "author": "-",
                      "edition": "2023年版",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "PHED109050",
                  "name": "体育-1",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "根据自己体育课的要求而定",
                      "author": "",
                      "edition": "",
                      "publisher": ""
                    }
                  ]
                },
                {
                  "code": "PHED109250",
                  "name": "体育-3",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHYS281609",
                  "name": "大学物理Ⅱ-2",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "两本教材内容完全一样，任选其一即可",
                  "books": [
                    {
                      "title": "大学物理学（下册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    },
                    {
                      "title": "大学物理（新版) (下册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "PHYS281909",
                  "name": "大学物理实验Ⅰ-2",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学物理实验",
                      "author": "高博 张沛 张俊武 王红理",
                      "edition": "3",
                      "publisher": "高等教育出版社"
                    }
                  ]
                }
              ]
            },
            {
              "name": "2025级环境工程",
              "note": "",
              "courses": [
                {
                  "code": "CHEM251409",
                  "name": "无机与分析化学",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "CHEM251309",
                  "name": "无机与分析化学实验",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "CHEM251009",
                  "name": "有机化学Ⅱ",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "CHEM342009",
                  "name": "有机化学实验-1",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201312",
                  "name": "西方礼仪文化",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201512",
                  "name": "欧洲文化渊源",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201612",
                  "name": "人文英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL201912",
                  "name": "美国文化",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202112",
                  "name": "商务英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202212",
                  "name": "新闻英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "新闻英语阅读教程",
                      "author": "黄奕 卢燕华",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL202312",
                  "name": "英语辩论",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202412",
                  "name": "英语电影视听说",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL202712",
                  "name": "理解当代中国：英语演讲",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203112",
                  "name": "英语学术论文写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203212",
                  "name": "中级英语写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203312",
                  "name": "中国文化翻译",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203412",
                  "name": "阅读与思辨",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL203612",
                  "name": "雅思写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": [
                    {
                      "title": "雅思写作实践教程",
                      "author": "王东",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203712",
                  "name": "沟通与文化交流",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "2024级教材，2025级暂时未知",
                  "books": [
                    {
                      "title": "跨文化交际：中英文化对比",
                      "author": "张桂萍",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "ENGL203812",
                  "name": "雅思口语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204012",
                  "name": "TED英语视听说Ⅱ",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204112",
                  "name": "医学英语视听说",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204512",
                  "name": "医学英语阅读",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL204612",
                  "name": "医学英语术语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205012",
                  "name": "国际学术交流英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205212",
                  "name": "国际人才英语",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL205312",
                  "name": "医学英语写作",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ENGL207212",
                  "name": "理解当代中国：英语读写",
                  "credits": "2",
                  "requirement": "24选1必修",
                  "note": "2024级教材，2025级暂时未知",
                  "books": [
                    {
                      "title": "《理解当代中国》大学英语综合教程2",
                      "author": "孙有中 何莲玲",
                      "edition": "1",
                      "publisher": "外语教学与研究出版社"
                    }
                  ]
                },
                {
                  "code": "MATH200807",
                  "name": "概率论",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "MLMD193514",
                  "name": "毛泽东思想和中国特色社会主义理论体系概论",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "毛泽东思想和中国特色社会主义理论体系概论",
                      "author": "-",
                      "edition": "2023年版",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "PHED109050",
                  "name": "体育-1",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "根据自己体育课的要求而定",
                      "author": "",
                      "edition": "",
                      "publisher": ""
                    }
                  ]
                },
                {
                  "code": "PHED109250",
                  "name": "体育-3",
                  "credits": "0.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHYS281609",
                  "name": "大学物理Ⅱ-2",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "两本教材内容完全一样，任选其一即可",
                  "books": [
                    {
                      "title": "大学物理学（下册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    },
                    {
                      "title": "大学物理（新版) (下册）",
                      "author": "吴百诗",
                      "edition": "1",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "PHYS281909",
                  "name": "大学物理实验Ⅰ-2",
                  "credits": "1",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "大学物理实验",
                      "author": "高博 张沛 张俊武 王红理",
                      "edition": "3",
                      "publisher": "高等教育出版社"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      "source": {
        "label": "本科教务系统 · 全校方案查询",
        "url": "https://ehall.xjtu.edu.cn"
      },
      "note": "本页内容由学长学姐根据教务系统整理，教材版次可能随任课教师要求变化。选课前请先确认任课教师指定的版本，再决定买新书还是二手书。"
    },
    "2024": {
      "label": "2024 级",
      "title": "2024 级本科生培养方案与所需教材",
      "intro": "2024 级同学已进入大三，本页为该年级**大三**两个学期的课程与教材，按专业模块分别列出。",
      "terms": [
        {
          "name": "大三上",
          "remark": "",
          "groups": [
            {
              "name": "2024级能源与动力工程A、B、C、D模块",
              "note": "注：交叉融合型、科学研究型与创新创业型培养方案未体现在本表格内",
              "courses": [
                {
                  "code": "ENPO340503",
                  "name": "传热学Ⅰ",
                  "credits": "3.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "传热学",
                      "author": "陶文铨",
                      "edition": "6",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO340703",
                  "name": "传热学（英）",
                  "credits": "3.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "传热学",
                      "author": "陶文铨",
                      "edition": "6",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO340903",
                  "name": "燃烧学Ⅰ",
                  "credits": "2.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "燃烧学",
                      "author": "徐通模 惠世恩",
                      "edition": "3",
                      "publisher": "机械工业出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO341003",
                  "name": "自动控制原理Ⅰ",
                  "credits": "2.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "自动控制原理",
                      "author": "巨林仓",
                      "edition": "2",
                      "publisher": "中国电力出版社"
                    }
                  ]
                },
                {
                  "code": "MACH391401",
                  "name": "机械设计基础Ⅰ",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "机械设计基础",
                      "author": "陈晓南 杨培林",
                      "edition": "4",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "ELEC327704",
                  "name": "电工电子技术-2",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电子技术（电工学2）",
                      "author": "王建华 刘晔",
                      "edition": "1",
                      "publisher": "电子工业出版社"
                    }
                  ]
                },
                {
                  "code": "ELEC327904",
                  "name": "电工电子技术实验-2",
                  "credits": "0.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电工学实验教程",
                      "author": "原晓楠",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO341603",
                  "name": "热流体课程实验-2",
                  "credits": "0.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "热与流体实验教程",
                      "author": "王小丹 孟婧 张可 吴青平 唐上朝",
                      "edition": "2",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "JZSJ900103",
                  "name": "科研训练",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900150",
                  "name": "长跑",
                  "credits": "0",
                  "requirement": "必修",
                  "note": "大三大四学期内通过1次即可",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900250",
                  "name": "200米游泳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900350",
                  "name": "24式太极拳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900750",
                  "name": "陆上赛艇",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                }
              ]
            },
            {
              "name": "2024级核工程与核技术A模块",
              "note": "注：交叉融合型、科学研究型与创新创业型培养方案未体现在本表格内",
              "courses": [
                {
                  "code": "ENPO340503",
                  "name": "传热学Ⅰ",
                  "credits": "3.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "传热学",
                      "author": "陶文铨",
                      "edition": "6",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO340703",
                  "name": "传热学（英）",
                  "credits": "3.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "传热学",
                      "author": "陶文铨",
                      "edition": "6",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "NUCL321203",
                  "name": "原子核物理",
                  "credits": "2.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "原子核物理",
                      "author": "杨福家",
                      "edition": "2",
                      "publisher": "复旦大学出版社"
                    }
                  ]
                },
                {
                  "code": "NUCL321103",
                  "name": "自动控制原理Ⅱ",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "自动控制原理",
                      "author": "孙培伟 魏新宇",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MACH391401",
                  "name": "机械设计基础Ⅰ",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "机械设计基础",
                      "author": "陈晓南 杨培林",
                      "edition": "4",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "ELEC327704",
                  "name": "电工电子技术-2",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电子技术（电工学2）",
                      "author": "王建华 刘晔",
                      "edition": "1",
                      "publisher": "电子工业出版社"
                    }
                  ]
                },
                {
                  "code": "ELEC327904",
                  "name": "电工电子技术实验-2",
                  "credits": "0.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电工学实验教程",
                      "author": "原晓楠",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO341603",
                  "name": "热流体课程实验-2",
                  "credits": "0.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "热与流体实验教程",
                      "author": "王小丹 孟婧 张可 吴青平 唐上朝",
                      "edition": "2",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "JZSJ900103",
                  "name": "科研训练",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900150",
                  "name": "长跑",
                  "credits": "0",
                  "requirement": "必修",
                  "note": "大三大四学期内通过1次即可",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900250",
                  "name": "200米游泳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900350",
                  "name": "24式太极拳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900750",
                  "name": "陆上赛艇",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                }
              ]
            },
            {
              "name": "2024级核工程与核技术B模块",
              "note": "注：交叉融合型、科学研究型与创新创业型培养方案未体现在本表格内",
              "courses": [
                {
                  "code": "NUCL320603",
                  "name": "电动力学",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "NUCL321203",
                  "name": "原子核物理",
                  "credits": "2.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "原子核物理",
                      "author": "杨福家",
                      "edition": "2",
                      "publisher": "复旦大学出版社"
                    }
                  ]
                },
                {
                  "code": "NUCL321103",
                  "name": "自动控制原理Ⅱ",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "自动控制原理",
                      "author": "孙培伟 魏新宇",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MACH391401",
                  "name": "机械设计基础Ⅰ",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "机械设计基础",
                      "author": "陈晓南 杨培林",
                      "edition": "4",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "ELEC327704",
                  "name": "电工电子技术-2",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电子技术（电工学2）",
                      "author": "王建华 刘晔",
                      "edition": "1",
                      "publisher": "电子工业出版社"
                    }
                  ]
                },
                {
                  "code": "ELEC327904",
                  "name": "电工电子技术实验-2",
                  "credits": "0.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电工学实验教程",
                      "author": "原晓楠",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "NUCL320403",
                  "name": "核材料基础",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "由ehall\"课程查询\"查得，不一定符合",
                  "books": [
                    {
                      "title": "反应堆结构与材料",
                      "author": "阎昌琪 王建军 谷海峰",
                      "edition": "1",
                      "publisher": "哈尔滨工程大学出版社"
                    }
                  ]
                },
                {
                  "code": "JZSJ900103",
                  "name": "科研训练",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900150",
                  "name": "长跑",
                  "credits": "0",
                  "requirement": "必修",
                  "note": "大三大四学期内通过1次即可",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900250",
                  "name": "200米游泳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900350",
                  "name": "24式太极拳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900750",
                  "name": "陆上赛艇",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                }
              ]
            },
            {
              "name": "2024级核工程与核技术C模块",
              "note": "注：交叉融合型、科学研究型与创新创业型培养方案未体现在本表格内",
              "courses": [
                {
                  "code": "NUCL422003",
                  "name": "放射化学",
                  "credits": "2.5",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "NUCL321203",
                  "name": "原子核物理",
                  "credits": "2.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "原子核物理",
                      "author": "杨福家",
                      "edition": "2",
                      "publisher": "复旦大学出版社"
                    }
                  ]
                },
                {
                  "code": "NUCL321103",
                  "name": "自动控制原理Ⅱ",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "自动控制原理",
                      "author": "孙培伟 魏新宇",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "MACH391401",
                  "name": "机械设计基础Ⅰ",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "机械设计基础",
                      "author": "陈晓南 杨培林",
                      "edition": "4",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "ELEC327704",
                  "name": "电工电子技术-2",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电子技术（电工学2）",
                      "author": "王建华 刘晔",
                      "edition": "1",
                      "publisher": "电子工业出版社"
                    }
                  ]
                },
                {
                  "code": "ELEC327904",
                  "name": "电工电子技术实验-2",
                  "credits": "0.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电工学实验教程",
                      "author": "原晓楠",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "NUCL320403",
                  "name": "核材料基础",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "由ehall\"课程查询\"查得，不一定符合",
                  "books": [
                    {
                      "title": "反应堆结构与材料",
                      "author": "阎昌琪 王建军 谷海峰",
                      "edition": "1",
                      "publisher": "哈尔滨工程大学出版社"
                    }
                  ]
                },
                {
                  "code": "JZSJ900103",
                  "name": "科研训练",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900150",
                  "name": "长跑",
                  "credits": "0",
                  "requirement": "必修",
                  "note": "大三大四学期内通过1次即可",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900250",
                  "name": "200米游泳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900350",
                  "name": "24式太极拳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900750",
                  "name": "陆上赛艇",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                }
              ]
            },
            {
              "name": "2024级核工程与核技术（强基计划）",
              "note": "注：交叉融合型、科学研究型与创新创业型培养方案未体现在本表格内",
              "courses": [
                {
                  "code": "ENPO340503",
                  "name": "传热学Ⅰ",
                  "credits": "3.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "传热学",
                      "author": "陶文铨",
                      "edition": "6",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO340703",
                  "name": "传热学（英）",
                  "credits": "3.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "传热学",
                      "author": "陶文铨",
                      "edition": "6",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "NUCL321203",
                  "name": "原子核物理",
                  "credits": "2.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "原子核物理",
                      "author": "杨福家",
                      "edition": "2",
                      "publisher": "复旦大学出版社"
                    }
                  ]
                },
                {
                  "code": "NUCL321103",
                  "name": "自动控制原理Ⅱ",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "自动控制原理",
                      "author": "孙培伟 魏新宇",
                      "edition": "1",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "ELEC327704",
                  "name": "电工电子技术-2",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电子技术（电工学2）",
                      "author": "王建华 刘晔",
                      "edition": "1",
                      "publisher": "电子工业出版社"
                    }
                  ]
                },
                {
                  "code": "ELEC327904",
                  "name": "电工电子技术实验-2",
                  "credits": "0.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电工学实验教程",
                      "author": "原晓楠",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO341603",
                  "name": "热流体课程实验-2",
                  "credits": "0.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "热与流体实验教程",
                      "author": "王小丹 孟婧 张可 吴青平 唐上朝",
                      "edition": "2",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "JZSJ900103",
                  "name": "科研训练",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900150",
                  "name": "长跑",
                  "credits": "0",
                  "requirement": "必修",
                  "note": "大三大四学期内通过1次即可",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900250",
                  "name": "200米游泳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900350",
                  "name": "24式太极拳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900750",
                  "name": "陆上赛艇",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                }
              ]
            },
            {
              "name": "2024级新能源科学与工程",
              "note": "注：交叉融合型、科学研究型与创新创业型培养方案未体现在本表格内",
              "courses": [
                {
                  "code": "ENPO340503",
                  "name": "传热学Ⅰ",
                  "credits": "3.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "传热学",
                      "author": "陶文铨",
                      "edition": "6",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO340703",
                  "name": "传热学（英）",
                  "credits": "3.5",
                  "requirement": "二选一必修",
                  "note": "",
                  "books": [
                    {
                      "title": "传热学",
                      "author": "陶文铨",
                      "edition": "6",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO340903",
                  "name": "燃烧学Ⅰ",
                  "credits": "2.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "燃烧学",
                      "author": "徐通模 惠世恩",
                      "edition": "3",
                      "publisher": "机械工业出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO341003",
                  "name": "自动控制原理Ⅰ",
                  "credits": "2.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "自动控制原理",
                      "author": "巨林仓",
                      "edition": "2",
                      "publisher": "中国电力出版社"
                    }
                  ]
                },
                {
                  "code": "NEEN300103",
                  "name": "固体与半导体物理",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ELEC327704",
                  "name": "电工电子技术-2",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电子技术（电工学2）",
                      "author": "王建华 刘晔",
                      "edition": "1",
                      "publisher": "电子工业出版社"
                    }
                  ]
                },
                {
                  "code": "ELEC327904",
                  "name": "电工电子技术实验-2",
                  "credits": "0.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电工学实验教程",
                      "author": "原晓楠",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO341603",
                  "name": "热流体课程实验-2",
                  "credits": "0.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "热与流体实验教程",
                      "author": "王小丹 孟婧 张可 吴青平 唐上朝",
                      "edition": "2",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "JZSJ900103",
                  "name": "科研训练",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900150",
                  "name": "长跑",
                  "credits": "0",
                  "requirement": "必修",
                  "note": "大三大四学期内通过1次即可",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900250",
                  "name": "200米游泳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900350",
                  "name": "24式太极拳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900750",
                  "name": "陆上赛艇",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                }
              ]
            },
            {
              "name": "2024级环境工程",
              "note": "注：交叉融合型、科学研究型与创新创业型培养方案未体现在本表格内",
              "courses": [
                {
                  "code": "EVNG300103",
                  "name": "环境工程原理",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "由ehall\"课程查询\"查得，不一定符合",
                  "books": [
                    {
                      "title": "环境工程原理",
                      "author": "胡洪营 张旭 黄霞 王伟",
                      "edition": "2",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "EVNG300903",
                  "name": "环境微生物学",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "EVNG300803",
                  "name": "环境专业基础实验",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "EVNG300503",
                  "name": "环境监测",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "ELEC327704",
                  "name": "电工电子技术-2",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电子技术（电工学2）",
                      "author": "王建华 刘晔",
                      "edition": "1",
                      "publisher": "电子工业出版社"
                    }
                  ]
                },
                {
                  "code": "ELEC327904",
                  "name": "电工电子技术实验-2",
                  "credits": "0.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电工学实验教程",
                      "author": "原晓楠",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "EVNG400103",
                  "name": "大气污染控制工程",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "",
                  "books": []
                },
                {
                  "code": "JZSJ900103",
                  "name": "科研训练",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900150",
                  "name": "长跑",
                  "credits": "0",
                  "requirement": "必修",
                  "note": "大三大四学期内通过1次即可",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900250",
                  "name": "200米游泳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900350",
                  "name": "24式太极拳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900750",
                  "name": "陆上赛艇",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                }
              ]
            },
            {
              "name": "2024级能源与动力工程（越杰）",
              "note": "注：交叉融合型、科学研究型与创新创业型培养方案未体现在本表格内",
              "courses": [
                {
                  "code": "ENPO340703",
                  "name": "传热学（英）",
                  "credits": "3.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "传热学",
                      "author": "陶文铨",
                      "edition": "6",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO340903",
                  "name": "燃烧学Ⅰ",
                  "credits": "2.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "燃烧学",
                      "author": "徐通模 惠世恩",
                      "edition": "3",
                      "publisher": "机械工业出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO341003",
                  "name": "自动控制原理Ⅰ",
                  "credits": "2.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "自动控制原理",
                      "author": "巨林仓",
                      "edition": "2",
                      "publisher": "中国电力出版社"
                    }
                  ]
                },
                {
                  "code": "MACH391401",
                  "name": "机械设计基础Ⅰ",
                  "credits": "4",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "机械设计基础",
                      "author": "陈晓南 杨培林",
                      "edition": "4",
                      "publisher": "科学出版社"
                    }
                  ]
                },
                {
                  "code": "ELEC327704",
                  "name": "电工电子技术-2",
                  "credits": "3",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电子技术（电工学2）",
                      "author": "王建华 刘晔",
                      "edition": "1",
                      "publisher": "电子工业出版社"
                    }
                  ]
                },
                {
                  "code": "ELEC327904",
                  "name": "电工电子技术实验-2",
                  "credits": "0.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "电工学实验教程",
                      "author": "原晓楠",
                      "edition": "1",
                      "publisher": "高等教育出版社"
                    }
                  ]
                },
                {
                  "code": "ENPO341603",
                  "name": "热流体课程实验-2",
                  "credits": "0.5",
                  "requirement": "必修",
                  "note": "",
                  "books": [
                    {
                      "title": "热与流体实验教程",
                      "author": "王小丹 孟婧 张可 吴青平 唐上朝",
                      "edition": "2",
                      "publisher": "西安交通大学出版社"
                    }
                  ]
                },
                {
                  "code": "JZSJ900103",
                  "name": "科研训练",
                  "credits": "2",
                  "requirement": "必修",
                  "note": "",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900150",
                  "name": "长跑",
                  "credits": "0",
                  "requirement": "必修",
                  "note": "大三大四学期内通过1次即可",
                  "books": [],
                  "noBook": true
                },
                {
                  "code": "PHED900250",
                  "name": "200米游泳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900350",
                  "name": "24式太极拳",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                },
                {
                  "code": "PHED900750",
                  "name": "陆上赛艇",
                  "credits": "0",
                  "requirement": "",
                  "note": "",
                  "books": []
                }
              ]
            }
          ]
        }
      ],
      "source": {
        "label": "本科教务系统 · 全校方案查询",
        "url": "https://ehall.xjtu.edu.cn"
      },
      "note": "本页内容由学长学姐根据教务系统整理，教材版次可能随任课教师要求变化。选课前请先确认任课教师指定的版本，再决定买新书还是二手书。"
    }
  }
};

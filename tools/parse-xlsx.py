# -*- coding: utf-8 -*-
"""
tools/parse-xlsx.py —— 把 Excel 内容表格转换成网站的数据文件

用法（在网站根目录执行）：
    python tools/parse-xlsx.py

输入：西安交通大学能动学院本科生互助表格（民间）.xlsx
输出：
    data/faq.js           常见问题
    data/links.js         校内常用网站 + 图标库
    data/general-edu.js   必选通识课（含思维导图结构 + 各模块课程清单）
    data/plans.js         2026 / 2025 / 2024 三级培养方案与教材
    data/book-options.js  二手教材表单的可选项（专业、年级类型、书籍清单、状态）
    data/seed-books.js    二手教材的初始数据（来自表格第 3 页）

以后表格更新了，重新跑一次这个脚本即可。
"""
import base64
import json
import os
import re
import sys

import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, '西安交通大学能动学院本科生互助表格（民间）.xlsx')
DATA = os.path.join(ROOT, 'data')

OBF_KEY = 'enpo-xjtu-2026'
TERMS = ['大一上', '大一下', '大二上', '大二下', '大三上', '大三下', '大四上', '大四下']
TYPES = ['通识课', '其它资料']

report = []


def log(msg):
    report.append(msg)


# --------------------------------------------------------------------------
# 小工具
# --------------------------------------------------------------------------
def s(v):
    """单元格取值 -> 去掉首尾空白的字符串"""
    if v is None:
        return ''
    if isinstance(v, float) and v == int(v):
        return str(int(v))
    return str(v).strip()


def norm(v):
    """把多行文本里的多余空白压掉"""
    return re.sub(r'[ \t]+', ' ', s(v)).strip()


def clean_note(text):
    """备注：保留换行，但把每行两端的空白和行内多余空格清掉，去掉空行"""
    lines = []
    for line in s(text).split('\n'):
        line = re.sub(r'[ \t]+', ' ', line).strip()
        if line:
            lines.append(line)
    return '\n'.join(lines)


def obfuscate(plain):
    """和网站 assets/js/core/util.js 里的算法保持一致"""
    if not plain:
        return ''
    x = ''.join(chr(ord(c) ^ ord(OBF_KEY[i % len(OBF_KEY)])) for i, c in enumerate(plain))
    return base64.b64encode(x[::-1].encode('utf-8')).decode()


def write_js(filename, title, assignments):
    """assignments: [(ENPO_DATA 下的键, 对象), ...]"""
    lines = [
        '/* ' + '=' * 74,
        ' * ' + filename + ' —— ' + title,
        ' * ----------------------------------------------------------------------------',
        ' * 这个文件由 tools/parse-xlsx.py 根据 Excel 表格自动生成。',
        ' * 想改内容有两种方式：',
        ' *   1）改 Excel 表格后重新运行 python tools/parse-xlsx.py',
        ' *   2）直接改这个文件（注意保持 JSON 的格式：引号、逗号）',
        ' *   3）登录网站后台，在「内容编辑」里改（改完立即对所有人生效）',
        ' * ' + '=' * 74 + ' */',
        'window.ENPO_DATA = window.ENPO_DATA || {};',
        ''
    ]
    for key, obj in assignments:
        lines.append('ENPO_DATA.' + key + ' = ' + json.dumps(obj, ensure_ascii=False, indent=2) + ';')
        lines.append('')
    path = os.path.join(DATA, filename)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(lines))
    log('  写入 %-24s %6.1f KB' % (filename, os.path.getsize(path) / 1024.0))


# --------------------------------------------------------------------------
# 1. 常见问题
# --------------------------------------------------------------------------
FAQ_CATEGORIES = [
    ('通识课与选课', '🧭', ['Q1', 'Q2', 'Q11', 'Q12', 'Q13', 'Q17']),
    ('体育课', '🏃', ['Q3', 'Q8', 'Q15', 'Q16']),
    ('英语课', '🔤', ['Q4']),
    ('教材与二手书', '📚', ['Q5', 'Q9']),
    ('成绩与考勤', '📊', ['Q10', 'Q21']),
    ('学籍与教务', '🗂️', ['Q6', 'Q18', 'Q22']),
    ('奖学金与保研', '🏅', ['Q7']),
    ('专业与方向', '⚙️', ['Q14']),
    ('图书馆', '📖', ['Q19', 'Q20']),
]


def parse_faq(ws):
    items = {}
    order = []
    for r in range(1, ws.max_row + 1):
        q = s(ws.cell(row=r, column=1).value)
        a = s(ws.cell(row=r, column=6).value)
        if not q.startswith('Q'):
            continue
        m = re.match(r'^(Q\d+)\s*\n?(.*)$', q, re.S)
        if not m:
            continue
        key = m.group(1)
        qtext = m.group(2).strip()
        atext = re.sub(r'^A\d+\s*\n?', '', a, flags=re.S).strip()
        items[key] = {'q': qtext, 'a': atext}
        order.append(key)

    cats = []
    used = set()
    for name, icon, keys in FAQ_CATEGORIES:
        arr = []
        for k in keys:
            if k in items:
                arr.append(items[k])
                used.add(k)
        if arr:
            cats.append({'name': name, 'icon': icon, 'items': arr})
        for k in keys:
            assert k in items, '找不到 ' + k
    missing = [k for k in order if k not in used]
    if missing:
        log('  ⚠ 未归类的问题：' + ','.join(missing))

    return {
        'intro': '这里汇总了学长学姐在群里、私聊里被问过千百遍的问题。'
                 '可以用下面的搜索框直接搜关键词，比如「体育」「通识课」「成绩」。',
        'note': '这些回答是同学们的经验总结，涉及具体规定的内容请以教务处、学院官网的正式通知为准。'
                '如果你发现哪条已经过时，欢迎到「意见建议」告诉我。',
        'categories': cats
    }


# --------------------------------------------------------------------------
# 2. 校内常用网站
# --------------------------------------------------------------------------
# （分组名, 图标）—— 链接按这个顺序展示
LINK_GROUPS = [
    ('学校主页与新闻', '🌐'),
    ('教务与学籍', '📘'),
    ('学习平台', '💻'),
    ('图书馆与学术', '📚'),
    ('学院与书院', '🏫'),
    ('实践与毕业', '🎯'),
    ('校园生活与服务', '🏢'),
]

# 网站名 -> (分组, 图标)
LINK_META = {
    '西安交通大学官网': ('学校主页与新闻', '🌐'),
    '西安交通大学新闻网': ('学校主页与新闻', '📰'),
    '西安交通大学本科教务': ('教务与学籍', '🖥️'),
    '西安交通大学教务处': ('教务与学籍', '📘'),
    '选课系统': ('教务与学籍', '🗳️'),
    '迎新注册离校系统': ('教务与学籍', '🎒'),
    '学生成长支持系统': ('教务与学籍', '🌱'),
    '考勤查询': ('教务与学籍', '⏱️'),
    '思源学堂': ('学习平台', '📖'),
    '西安交通大学网络教学平台': ('学习平台', '🎬'),
    '教师主页门户': ('学习平台', '👤'),
    '学术资源平台': ('图书馆与学术', '🎓'),
    '图书馆官网': ('图书馆与学术', '📚'),
    '能动学院官网': ('学院与书院', '⚙️'),
    '核科学与技术学院官网': ('学院与书院', '☢️'),
    '能动学院国家级实验教学示范中心': ('学院与书院', '🧪'),
    '彭康书院官网': ('学院与书院', '🏠'),
    '毕业设计（论文）管理系统': ('实践与毕业', '🎯'),
    '专业实习管理系统': ('实践与毕业', '🛠️'),
    '研究生信息管理系统': ('实践与毕业', '🔬'),
    '学生邮件系统': ('校园生活与服务', '✉️'),
    '西安交通大学WebVPN': ('校园生活与服务', '🔐'),
    '网络信息中心': ('校园生活与服务', '📡'),
    '校医院': ('校园生活与服务', '🏥'),
    '西安交通大学学生处': ('校园生活与服务', '🎓'),
    '西安交通大学财务处': ('校园生活与服务', '💰'),
    '保卫处': ('校园生活与服务', '🛡️'),
    '后勤保障部': ('校园生活与服务', '🍚'),
    '心理健康服务平台': ('校园生活与服务', '💚'),
    '实验室管理处': ('校园生活与服务', '⚗️'),
}

# 常用图标库，站主在后台添加网站时可以直接挑
ICON_SET = [
    {'group': '学校与学院', 'icons': ['🌐', '🏫', '🎓', '🏛️', '⚙️', '☢️', '🧪', '🏠', '📰', '🎒', '🌱', '👤']},
    {'group': '学习与教务', 'icons': ['📘', '📗', '📙', '📕', '📚', '📖', '✏️', '📝', '🗳️', '🖥️', '💻', '🎬']},
    {'group': '成绩与实践', 'icons': ['📊', '📈', '🏅', '🎯', '🛠️', '🔬', '⚗️', '🧰', '📐', '🧮']},
    {'group': '服务与生活', 'icons': ['✉️', '📮', '📡', '🔐', '🔑', '🏥', '💰', '🛡️', '🍚', '🏢', '🚌', '💚']},
    {'group': '常用符号', 'icons': ['🔗', '📌', '⭐', '✅', 'ℹ️', '🆘', '📅', '⏱️', '🧭', '☎️', '📢', '🗂️']},
]


def parse_links(ws):
    sites = []
    for r in range(1, ws.max_row + 1):
        name = norm(ws.cell(row=r, column=2).value)
        url = s(ws.cell(row=r, column=6).value)
        note = norm(ws.cell(row=r, column=10).value)
        if not name or not url or name in ('网站名称', '学校常用网站汇总'):
            continue
        # 一个单元格里可能放了多个网址，用「空格 + 斜杠 + 空格」分隔，
        # 注意不能直接按 / 切分，否则 http:// 里的双斜杠会被切开
        urls = [u.strip() for u in re.split(r'\s+/\s+', url) if u.strip()]
        urls = [u for u in urls if u.startswith('http')]
        if not urls:
            log('  ⚠ 网址无法识别：' + name + ' -> ' + url)
            continue
        meta = LINK_META.get(name)
        if not meta:
            log('  ⚠ 网站没有配置分组和图标：' + name)
            meta = ('校园生活与服务', '🔗')
        sites.append({
            'name': name,
            'url': urls[0],
            'altUrls': urls[1:],
            'desc': note,
            'icon': meta[1],
            '_group': meta[0],
        })

    groups = []
    for gname, gicon in LINK_GROUPS:
        items = [x for x in sites if x['_group'] == gname]
        if items:
            groups.append({'name': gname, 'icon': gicon, 'items': items})
    # 分组完成后再把内部用的标记去掉
    for g in groups:
        for x in g['items']:
            x.pop('_group', None)

    return {
        'intro': '把能动本科生日常真正会用到的校内网站集中在这里，省得每次翻收藏夹。'
                 '所有链接都会在新标签页打开。',
        'note': '本站只提供跳转入口，这些网站的内容由学校各相关单位负责，与本站无关。'
                '标注了「需要校园网」的网站，在校外请先连接 WebVPN。',
        'groups': groups,
    }


# --------------------------------------------------------------------------
# 3. 必选通识课
# --------------------------------------------------------------------------
def parse_general_edu(ws):
    modules = []
    cur = None
    for r in range(1, ws.max_row + 1):
        a = norm(ws.cell(row=r, column=1).value)
        name = norm(ws.cell(row=r, column=4).value)
        credits = norm(ws.cell(row=r, column=8).value)
        college = norm(ws.cell(row=r, column=10).value)

        # 整行都空 -> 跳过（注意不能用「课程代码和课程名称都空」判断，
        # 因为经济管理类的续行只有「开课学院」一列有值）
        if not any([a, name, credits, college]):
            continue
        if a == '课程代码':
            continue
        if a.startswith('备注：') or a.startswith('能动学院必选通识课汇总'):
            continue
        # 经济管理类：不限制具体课程，只要求开课学院。
        # 这一段的续行只在「开课学院」列有内容；如果整行是下一个模块的标题，
        # 就让它继续往下走，交给模块标题分支处理。
        if cur is not None and cur.get('unrestricted'):
            if college and college not in cur['colleges']:
                cur['colleges'].append(college)
                if credits:
                    cur['credits'] = credits
                continue
            if credits and not college:
                cur['credits'] = credits
                continue
        # 模块标题行：只有第一列有内容
        if a and not name:
            cur = {
                'name': a,
                'icon': '📗',
                'audience': '',
                'credits': '',
                'unrestricted': False,
                'colleges': [],
                'courses': [],
            }
            modules.append(cur)
            continue
        if cur is None:
            continue

        # 经济管理类的第一行（形如 GNEDxxxxxx + 不限制具体课程）
        if '经济管理类' in cur['name'] and (not name or '不限制' in name or a.endswith('xxxxxx')):
            cur['unrestricted'] = True
            cur['credits'] = credits or cur['credits']
            if college and college not in cur['colleges']:
                cur['colleges'].append(college)
            continue

        if name:
            kind = '核心课' if a.startswith('CORE') else ('选修课' if a.startswith('GNED') else '')
            cur['courses'].append({
                'code': a,
                'name': name,
                'credits': credits,
                'college': college,
                'kind': kind,
                'note': '',
            })

    # 人工补充的分组说明
    for m in modules:
        if '工程伦理' in m['name']:
            m['icon'] = '⚖️'
            m['audience'] = '所有专业（含核）均需修读 2 学分'
            m['credits'] = '2'
        elif '项目管理' in m['name']:
            m['icon'] = '📋'
            m['audience'] = '仅核工程与核技术相关专业需要'
            m['credits'] = '2'
        elif '工程经济学' in m['name']:
            m['icon'] = '📈'
            m['audience'] = '仅核工程与核技术相关专业需要'
            m['credits'] = '2'
        elif '经济管理' in m['name']:
            m['icon'] = '💼'
            # 适用对象不在这里写死：核与非核的差异已经由「模块名」和「学院要求」表达清楚
            m['audience'] = ''
            m['credits'] = '2'
        elif '创新创业' in m['name']:
            m['icon'] = '💡'
            m['audience'] = '所有专业均需修读 2 学分'
            m['credits'] = '2'
            # 创新创业栏那一列混了「课程类型」和「备注」，重新整理。
            # 这个模块的「开课学院」列在原表格里没有意义，统一清空（页面上也不显示这一列）。
            for c in m['courses']:
                if c['college'] in ('核心课', '选修课'):
                    c['kind'] = c['college']
                c['college'] = ''
                c['note'] = ''

    # 创新创业类课程：标记不再计入的那门课
    for m in modules:
        if '创新创业' in m['name']:
            for c in m['courses']:
                if c['code'] == 'GNED106392':
                    c['disabled'] = True
                    c['note'] = ('自 2026-2027 学年第 1 学期起，这门课不再计入创新创业类选修课，'
                                 '不能再用来抵这 2 学分。此前已经选过并取得成绩的仍然有效。')

    # 学校层面的两个限选要求（表格里没有具体课程清单）
    modules.insert(0, {
        'name': '文化传承与艺术审美',
        'icon': '🎨',
        'audience': '学校要求：所有专业最少选 1 门',
        'credits': '不限学分',
        'unrestricted': False,
        'colleges': [],
        'courses': [],
        'emptyHint': '具体课程清单请到本科教务系统（ehall.xjtu.edu.cn）的「全校方案查询」里查看，'
                     '只要课程属于「文化传承与艺术审美」模块即可。',
    })
    modules.insert(1, {
        'name': '经典导读与学术写作',
        'icon': '📜',
        'audience': '学校要求：所有专业最少选 1 门',
        'credits': '不限学分',
        'unrestricted': False,
        'colleges': [],
        'courses': [],
        'emptyHint': '具体课程清单请到本科教务系统（ehall.xjtu.edu.cn）的「全校方案查询」里查看，'
                     '只要课程属于「经典导读与学术写作」模块即可。',
    })

    return {
        'title': '能动学院必选通识课',
        'intro': '这里汇总能动学院同学需要修读的通识课程：学分要求、模块要求，'
                 '以及各个模块下有哪些课程可以选。',
        'rules': [
            {'label': '通识类核心课', 'value': '6 学分', 'note': '课程代码以 CORE 开头'},
            {'label': '通识类选修课', 'value': '6 学分', 'note': '课程代码以 GNED 开头'},
            {'label': '修读模块数', 'value': '不少于 3 个模块', 'note': '全部通识课程合计'},
            {'label': '单个模块上限', 'value': '不超过 2 门课', 'note': '每个模块内单独计算'},
            {'label': '完成时间', 'value': '本科四年内修完', 'note': '不要求在一个学期内学完'},
        ],
        'map': {
            'root': '能动学院必选通识课',
            'notes': [
                '除必选要求外，四年内必须修完：通识类核心课 6 学分 + 通识类选修课 6 学分',
                '全部通识课程修读不得少于 3 个模块',
                '每个模块内修读不得超过 2 门课程',
            ],
            'branches': [
                {
                    'title': '学校要求',
                    'icon': '🏫',
                    'children': [
                        {'title': '文化传承与艺术审美', 'value': '最少 1 门，不限学分', 'icon': '🎨'},
                        {'title': '经典导读与学术写作', 'value': '最少 1 门，不限学分', 'icon': '📜'},
                        {
                            'title': '创新创业类', 'value': '2 学分', 'icon': '💡',
                            'children': [
                                {'title': '在通识课的「哲学智慧与创新思维」模块修 2 学分'},
                                {'title': '在专业选修课中选择相关课程，修 2 学分'},
                            ]
                        },
                    ]
                },
                {
                    'title': '学院要求',
                    'icon': '⚙️',
                    'children': [
                        {
                            'title': '对于能动（含越杰）、新能源、环境工程、储能',
                            'icon': '🔧',
                            'children': [
                                {'title': '工程伦理类', 'value': '2 学分'},
                                {'title': '经济管理类', 'value': '2 学分'},
                            ]
                        },
                        {
                            'title': '对于核',
                            'icon': '☢️',
                            'children': [
                                {'title': '工程伦理类', 'value': '2 学分'},
                                {'title': '工程经济学类', 'value': '2 学分'},
                                {'title': '项目管理类', 'value': '2 学分'},
                            ]
                        },
                    ]
                },
            ]
        },
        'modules': modules,
        'source': {'label': '本科教务系统（全校方案查询）', 'url': 'https://ehall.xjtu.edu.cn'},
        'note': '以上课程清单来自学长学姐整理的表格，可能随培养方案调整而变化。'
                '选课前请务必到本科教务系统核对当学期实际开课情况。'
    }


# --------------------------------------------------------------------------
# 4. 培养方案
# --------------------------------------------------------------------------
def parse_plan(ws, year):
    terms = []
    cur_term = None
    cur_group = None
    cur_course = None
    last_req = ''
    stats = {'course': 0, 'book': 0, 'group': 0}

    def ensure_group():
        nonlocal cur_group
        if cur_group is None:
            cur_group = {'name': '全部课程', 'note': '', 'courses': []}
            if cur_term is not None:
                cur_term['groups'].append(cur_group)
        return cur_group

    for r in range(1, ws.max_row + 1):
        v = [s(ws.cell(row=r, column=c).value) for c in range(1, 11)]
        a, b, c, d, e, f, g, h, i = (v + [''] * 9)[:9]
        if not any(v):
            continue
        if re.match(r'^\d{4}级培养方案', a):
            continue
        # 学期行：单元格里可能还有第二行备注，所以只取第一行来判断
        a_first = a.split('\n')[0].strip()
        if a_first in TERMS:
            remark = '\n'.join(a.split('\n')[1:]).strip()
            cur_term = {'name': a_first, 'remark': remark, 'groups': []}
            terms.append(cur_term)
            cur_group = None
            cur_course = None
            last_req = ''
            continue
        if a.startswith('注：'):
            grp = ensure_group()
            grp['note'] = (grp['note'] + ' ' + a).strip()
            continue
        if a == '课程代码':
            continue
        # 专业组标题
        if a and not b and not e:
            cur_group = {'name': a, 'note': '', 'courses': []}
            if cur_term is None:
                cur_term = {'name': '其他', 'groups': []}
                terms.append(cur_term)
            cur_term['groups'].append(cur_group)
            cur_course = None
            last_req = ''
            stats['group'] += 1
            continue

        grp = ensure_group()

        if b:
            req = d
            if not req and last_req and last_req != '必修':
                req = last_req
            if req:
                last_req = req
            # 「要求」这一列有时会带换行（例如"必修\n要求见备注"），
            # 换行会让同一个选择组被拆散，所以统一压成一行
            req = re.sub(r'\s*\n\s*', ' ', req).strip()
            cur_course = {
                'code': a, 'name': b, 'credits': c, 'requirement': req,
                'note': clean_note(i), 'books': []
            }
            if e and e != '无教材':
                cur_course['books'].append({'title': e, 'author': f, 'edition': g, 'publisher': h})
                stats['book'] += 1
            elif e == '无教材':
                cur_course['noBook'] = True
            grp['courses'].append(cur_course)
            stats['course'] += 1
            continue

        if e and cur_course is not None:
            if e == '无教材':
                cur_course['noBook'] = True
            else:
                cur_course['books'].append({'title': e, 'author': f, 'edition': g, 'publisher': h})
                stats['book'] += 1
            n = clean_note(i)
            if n and n != cur_course['note']:
                # 续行的备注换行显示，不要拼成一整行
                cur_course['note'] = (cur_course['note'] + '\n' + n).strip() if cur_course['note'] else n
            continue
        # 其余行忽略

    log('  %s级：学期 %d 个、专业组 %d 个、课程 %d 门、教材 %d 条'
        % (year, len(terms), stats['group'], stats['course'], stats['book']))

    year_intro = {
        '2026': '2026 级入学，本页为该年级**大一**两个学期的课程与教材。'
                '大一的教材无论模块和方向都是相同的。',
        '2025': '2025 级同学已进入大二，本页为该年级**大二**两个学期的课程与教材，'
                '按「能动 A/B/C/D 模块」和「核工程 A/B/C 模块」分别列出。',
        '2024': '2024 级同学已进入大三，本页为该年级**大三**两个学期的课程与教材，'
                '按专业模块分别列出。',
    }[year]

    return {
        'label': year + ' 级',
        'title': year + ' 级本科生培养方案与所需教材',
        'intro': year_intro,
        'terms': terms,
        'source': {'label': '本科教务系统 · 全校方案查询', 'url': 'https://ehall.xjtu.edu.cn'},
        'note': '本页内容由学长学姐根据教务系统整理，教材版次可能随任课教师要求变化。'
                '选课前请先确认任课教师指定的版本，再决定买新书还是二手书。',
    }


# --------------------------------------------------------------------------
# 5. 二手教材：表单可选项 + 初始数据
# --------------------------------------------------------------------------
MAJORS = ['能动A模块', '能动B模块', '能动C模块', '能动D模块', '新能源',
          '核工程A模块', '核工程B模块', '核工程C模块', '能动强基', '环境工程', '储能', '其它']

STATUSES = [
    {'value': 'no', 'label': '否', 'desc': '都还在，随时可以联系'},
    {'value': 'contacting', 'label': '正在联系中', 'desc': '有人在联系了，还没定下来'},
    {'value': 'partial', 'label': '未出完', 'desc': '出了一部分，剩下的还可以联系'},
    {'value': 'yes', 'label': '是', 'desc': '已经全部出掉了'},
]

STATUS_MAP = {'是': 'yes', '否': 'no', '正在联系中': 'contacting', '未出完': 'partial', '': 'unknown'}


def collect_book_names(plans, general_edu):
    """从培养方案里收集所有教材名称，按学期分组，供表单里多选"""
    groups = {}
    for year in ['2026', '2025', '2024']:
        for term in plans[year]['terms']:
            bucket = groups.setdefault(term['name'], set())
            for g in term['groups']:
                for c in g['courses']:
                    for bk in c['books']:
                        if bk['title'] and len(bk['title']) >= 2:
                            bucket.add(bk['title'])
    # 通识课教材
    ts = groups.setdefault('通识课', set())
    for m in general_edu['modules']:
        for c in m['courses']:
            ts.add(c['name'])
    out = []
    for name in TERMS:
        if name in groups and groups[name]:
            out.append({'term': name, 'items': sorted(groups[name], key=lambda x: (len(x), x))})
    if '通识课' in groups:
        out.append({'term': '通识课', 'items': sorted(groups['通识课'], key=lambda x: (len(x), x))})
    out.append({'term': '其它资料', 'items': [
        '四级真题与词汇书', '六级真题与词汇书', '考研资料', '课程报告与大作业',
        '课堂笔记', '习题解答与辅导书', '实验报告模板',
    ]})
    return out


def parse_books(ws, book_name_groups, plans):
    """解析第 3 页：联系方式与书目"""
    all_names = []
    for g in book_name_groups:
        all_names.extend(g['items'])
    # 去掉过短的名字，避免误匹配
    all_names = sorted(set(n for n in all_names if len(n) >= 4), key=len, reverse=True)

    books = []
    skipped = 0
    matched_total = 0
    now = 1780000000000  # 固定时间戳，保证每次生成结果一致

    for r in range(1, ws.max_row + 1):
        qq = s(ws.cell(row=r, column=1).value)
        major = norm(ws.cell(row=r, column=2).value)
        want = s(ws.cell(row=r, column=3).value)
        status_raw = norm(ws.cell(row=r, column=4).value)
        note = s(ws.cell(row=r, column=5).value)
        flag = norm(ws.cell(row=r, column=6).value)

        if not qq or qq == 'QQ号':
            continue
        # QQ 号必须是纯数字，这样能自动跳过标题行和说明行
        if not re.match(r'^\d{5,12}$', qq.replace(' ', '')):
            continue
        qq = qq.replace(' ', '')
        if flag == '示例':
            skipped += 1
            continue

        want_list = [x.strip() for x in re.split(r'[,，、\s]+', want) if x.strip()]
        want_list = [x for x in want_list if x in TERMS + TYPES]

        # 从备注里尝试识别出教材名称（保守匹配：完整书名出现在备注里才算）
        found = []
        for n in all_names:
            if n in note and n not in found:
                found.append(n)
        found = sorted(found, key=lambda x: note.index(x))[:12]
        matched_total += len(found)

        idx = len(books)
        books.append({
            'id': 'seed_bk_%03d' % (idx + 1),
            'createdAt': now - (len(books) * 3600000),
            'updatedAt': now - (len(books) * 3600000),
            'qqBlob': obfuscate(qq),
            'major': major,
            'terms': want_list,
            'books': found,
            'status': STATUS_MAP.get(status_raw, 'unknown'),
            'note': note,
            'review': 'approved',
            'reviewNote': '',
            'needsReview': False,
            'reviewedAt': now,
            'editCodeHash': '',
            'origin': 'seed',
        })

    log('  二手教材：导入 %d 条（跳过示例行 %d 条），从备注里识别出教材名 %d 个'
        % (len(books), skipped, matched_total))
    return books


# --------------------------------------------------------------------------
# 主流程
# --------------------------------------------------------------------------
def main():
    if not os.path.exists(SRC):
        print('找不到 Excel 文件：' + SRC)
        sys.exit(1)
    if not os.path.isdir(DATA):
        os.makedirs(DATA)

    wb = openpyxl.load_workbook(SRC, data_only=True)
    sheets = wb.worksheets
    log('读取表格：%s' % os.path.basename(SRC))
    log('工作表：' + ' / '.join(ws.title for ws in sheets))
    log('')

    log('【1/6】常见问题')
    faq = parse_faq(sheets[1])
    write_js('faq.js', '常见问题', [('faq', faq)])

    log('【2/6】校内常用网站')
    links = parse_links(sheets[7])
    n_sites = sum(len(g['items']) for g in links['groups'])
    log('  共 %d 个网站，分为 %d 组' % (n_sites, len(links['groups'])))
    write_js('links.js', '校内常用网站 + 图标库', [('links', links), ('iconSet', ICON_SET)])

    log('【3/6】必选通识课')
    general = parse_general_edu(sheets[6])
    log('  共 %d 个模块、%d 门课程'
        % (len(general['modules']), sum(len(m['courses']) for m in general['modules'])))
    write_js('general-edu.js', '能动学院必选通识课', [('generalEdu', general)])

    log('【4/6】培养方案')
    plans = {}
    for idx, year in [(3, '2026'), (4, '2025'), (5, '2024')]:
        plans[year] = parse_plan(sheets[idx], year)
    write_js('plans.js', '2026 / 2025 / 2024 级培养方案与教材',
             [('plans', {'order': ['2026', '2025', '2024'], 'years': plans})])

    log('【5/6】二手教材表单选项')
    book_groups = collect_book_names(plans, general)
    options = {
        'majors': MAJORS,
        'terms': TERMS + TYPES,
        'statuses': STATUSES,
        'bookGroups': book_groups,
        'note': '这些选项都可以由站主在网站后台的「选项管理」里增删改，改完立即对所有人生效。',
    }
    log('  书籍清单：%d 组、共 %d 项'
        % (len(book_groups), sum(len(g['items']) for g in book_groups)))
    write_js('book-options.js', '二手教材表单的可选项', [('bookOptions', options)])

    log('【6/6】二手教材初始数据')
    seed = parse_books(sheets[2], book_groups, plans)
    write_js('seed-books.js', '二手教材初始数据（来自表格第 3 页）', [('seedBooks', seed)])

    # 后端（Cloudflare）自动导入初始数据时用这个文件
    seed_module = (
        '/* 由 tools/parse-xlsx.py 自动生成：后端初始化用的初始数据 */\n'
        'export const SEED_BOOKS = ' + json.dumps(seed, ensure_ascii=False, indent=2) + ';\n'
    )
    api_seed = os.path.join(ROOT, 'api', 'seed.js')
    os.makedirs(os.path.dirname(api_seed), exist_ok=True)
    with open(api_seed, 'w', encoding='utf-8', newline='\n') as f:
        f.write(seed_module)
    log('  写入 %-24s %6.1f KB' % ('api/seed.js', os.path.getsize(api_seed) / 1024.0))

    print('\n'.join(report))
    print('\n完成！共生成 6 个数据文件，都在 data/ 目录下。')


if __name__ == '__main__':
    main()

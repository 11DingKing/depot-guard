"""
前端页面视图
"""
from django.views.generic import TemplateView


class LoginPageView(TemplateView):
    """登录页面"""
    template_name = 'login.html'


class IndexPageView(TemplateView):
    """主页面"""
    template_name = 'index.html'


class TestPageView(TemplateView):
    """测试页面"""
    template_name = 'test.html'


class DashboardPageView(TemplateView):
    """仪表盘页面"""
    template_name = 'pages/dashboard.html'


class StockInPageView(TemplateView):
    """货物入库页面"""
    template_name = 'pages/stock_in.html'


class UnitPageView(TemplateView):
    """单位管理页面"""
    template_name = 'pages/unit.html'


class CategoryPageView(TemplateView):
    """品类管理页面"""
    template_name = 'pages/category.html'


class VarietyPageView(TemplateView):
    """品种管理页面"""
    template_name = 'pages/variety.html'


class QueryExportPageView(TemplateView):
    """查询导出页面"""
    template_name = 'pages/query_export.html'


class DailyReportPageView(TemplateView):
    """每日报表页面"""
    template_name = 'pages/daily_report.html'


class WarningPageView(TemplateView):
    """预警页面"""
    template_name = 'pages/warning.html'


class ApprovalPageView(TemplateView):
    """审批区域页面"""
    template_name = 'pages/approval.html'


class AttendancePersonPageView(TemplateView):
    """考勤人员管理页面"""
    template_name = 'pages/attendance_person.html'


class StockOutPersonPageView(TemplateView):
    """出库人员管理页面"""
    template_name = 'pages/stock_out_person.html'

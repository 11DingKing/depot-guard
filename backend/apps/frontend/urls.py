"""
前端页面URL配置
URL格式: /menu/页面名/
"""
from django.urls import path
from .views import (
    LoginPageView, IndexPageView, TestPageView, DashboardPageView,
    StockInPageView, UnitPageView, CategoryPageView, VarietyPageView,
    QueryExportPageView, DailyReportPageView, WarningPageView,
    ApprovalPageView, AttendancePersonPageView, StockOutPersonPageView
)

urlpatterns = [
    # 登录页面
    path('', LoginPageView.as_view(), name='login-page'),
    path('login/', LoginPageView.as_view(), name='login-page-alt'),
    
    # 主页面
    path('index/', IndexPageView.as_view(), name='index-page'),
    path('test/', TestPageView.as_view(), name='test-page'),
    
    # 菜单页面 - 格式: /menu/页面名/
    path('menu/dashboard/', DashboardPageView.as_view(), name='dashboard-page'),
    path('menu/stock-in/', StockInPageView.as_view(), name='stock-in-page'),
    path('menu/unit/', UnitPageView.as_view(), name='unit-page'),
    path('menu/category/', CategoryPageView.as_view(), name='category-page'),
    path('menu/variety/', VarietyPageView.as_view(), name='variety-page'),
    path('menu/query-export/', QueryExportPageView.as_view(), name='query-export-page'),
    path('menu/daily-report/', DailyReportPageView.as_view(), name='daily-report-page'),
    path('menu/warning/', WarningPageView.as_view(), name='warning-page'),
    path('menu/approval/', ApprovalPageView.as_view(), name='approval-page'),
    path('menu/attendance-person/', AttendancePersonPageView.as_view(), name='attendance-person-page'),
    path('menu/stock-out-person/', StockOutPersonPageView.as_view(), name='stock-out-person-page'),
]

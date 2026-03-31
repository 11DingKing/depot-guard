"""
报表模块测试用例
"""
from datetime import datetime, timedelta
from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.authentication.models import User
from apps.authentication.backends import generate_token
from apps.warehouse.models import Category, Variety, Unit, Goods, StockIn, StockOut
from .models import DailyReport


class DailyReportModelTest(TestCase):
    """每日报表模型测试"""
    
    def test_create_daily_report(self):
        """测试创建每日报表"""
        report = DailyReport.objects.create(
            report_date=datetime.now().date(),
            total_in_count=10,
            total_in_quantity=100,
            total_out_count=5,
            total_out_quantity=50,
            warning_count=2
        )
        
        self.assertEqual(report.total_in_count, 10)
        self.assertEqual(report.total_out_count, 5)
    
    def test_daily_report_str(self):
        """测试每日报表字符串表示"""
        report = DailyReport.objects.create(
            report_date=datetime.now().date()
        )
        self.assertIn('报表', str(report))


class DashboardAPITest(APITestCase):
    """仪表盘API测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = generate_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        # 创建测试数据
        self.category = Category.objects.create(name='办公用品')
        self.variety = Variety.objects.create(
            category=self.category,
            name='笔类'
        )
        self.unit = Unit.objects.create(name='支')
        self.goods = Goods.objects.create(
            variety=self.variety,
            unit=self.unit,
            name='圆珠笔',
            code='YZB001',
            quantity=100,
            warning_threshold=10
        )
        
        self.url = '/api/dashboard/'
    
    def test_get_dashboard(self):
        """测试获取仪表盘数据"""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        
        # 验证返回字段
        self.assertIn('goods_count', data['data'])
        self.assertIn('warning_goods_count', data['data'])
        self.assertIn('today_in_count', data['data'])
        self.assertIn('today_out_count', data['data'])
        self.assertIn('in_trend', data['data'])
        self.assertIn('out_trend', data['data'])
    
    def test_dashboard_goods_count(self):
        """测试仪表盘货物统计"""
        # 创建更多货物
        Goods.objects.create(
            variety=self.variety,
            unit=self.unit,
            name='钢笔',
            code='GB001',
            quantity=50
        )
        
        response = self.client.get(self.url)
        data = response.json()
        
        self.assertEqual(data['data']['goods_count'], 2)
    
    def test_dashboard_warning_count(self):
        """测试仪表盘预警统计"""
        # 创建预警货物
        Goods.objects.create(
            variety=self.variety,
            unit=self.unit,
            name='铅笔',
            code='QB001',
            quantity=5,
            warning_threshold=10
        )
        
        response = self.client.get(self.url)
        data = response.json()
        
        self.assertEqual(data['data']['warning_goods_count'], 1)


class DailyReportAPITest(APITestCase):
    """每日报表API测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = generate_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.url = '/api/daily-report/'
    
    def test_get_daily_report(self):
        """测试获取每日报表"""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIsInstance(data['data'], list)
    
    def test_get_daily_report_with_date_range(self):
        """测试按日期范围获取报表"""
        today = datetime.now().date()
        start_date = (today - timedelta(days=7)).strftime('%Y-%m-%d')
        end_date = today.strftime('%Y-%m-%d')
        
        response = self.client.get(self.url, {
            'start_date': start_date,
            'end_date': end_date
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        # 应该返回8天的数据
        self.assertEqual(len(data['data']), 8)


class ExportAPITest(APITestCase):
    """导出API测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = generate_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        # 创建测试数据
        self.category = Category.objects.create(name='办公用品')
        self.variety = Variety.objects.create(
            category=self.category,
            name='笔类'
        )
        self.unit = Unit.objects.create(name='支')
        self.goods = Goods.objects.create(
            variety=self.variety,
            unit=self.unit,
            name='圆珠笔',
            code='YZB001',
            quantity=100
        )
        
        self.url = '/api/export/'
    
    def test_export_goods(self):
        """测试导出货物"""
        response = self.client.get(self.url, {'type': 'goods'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response['Content-Type'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    
    def test_export_stock_in(self):
        """测试导出入库记录"""
        # 创建入库记录
        StockIn.objects.create(
            goods=self.goods,
            operator=self.user,
            quantity=50
        )
        
        response = self.client.get(self.url, {'type': 'stock_in'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_export_invalid_type(self):
        """测试导出无效类型"""
        response = self.client.get(self.url, {'type': 'invalid'})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

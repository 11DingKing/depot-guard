"""
库房管理模块测试用例
"""
from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.authentication.models import User
from apps.authentication.backends import generate_token
from .models import Unit, Category, Variety, Goods, StockIn, StockOut, Warning, Approval


class UnitModelTest(TestCase):
    """单位模型测试"""
    
    def test_create_unit(self):
        """测试创建单位"""
        unit = Unit.objects.create(
            name='千克',
            symbol='kg',
            description='重量单位'
        )
        
        self.assertEqual(unit.name, '千克')
        self.assertEqual(unit.symbol, 'kg')
        self.assertTrue(unit.is_active)
    
    def test_unit_str(self):
        """测试单位字符串表示"""
        unit = Unit.objects.create(name='米')
        self.assertEqual(str(unit), '米')


class CategoryModelTest(TestCase):
    """品类模型测试"""
    
    def test_create_category(self):
        """测试创建品类"""
        category = Category.objects.create(
            name='办公用品',
            code='BGWP',
            description='办公相关物品'
        )
        
        self.assertEqual(category.name, '办公用品')
        self.assertEqual(category.code, 'BGWP')
    
    def test_category_str(self):
        """测试品类字符串表示"""
        category = Category.objects.create(name='电子设备')
        self.assertEqual(str(category), '电子设备')


class VarietyModelTest(TestCase):
    """品种模型测试"""
    
    def setUp(self):
        """测试前准备"""
        self.category = Category.objects.create(name='办公用品')
    
    def test_create_variety(self):
        """测试创建品种"""
        variety = Variety.objects.create(
            category=self.category,
            name='笔类',
            code='BL'
        )
        
        self.assertEqual(variety.category, self.category)
        self.assertEqual(variety.name, '笔类')
    
    def test_variety_str(self):
        """测试品种字符串表示"""
        variety = Variety.objects.create(
            category=self.category,
            name='纸类'
        )
        self.assertIn('办公用品', str(variety))
        self.assertIn('纸类', str(variety))


class GoodsModelTest(TestCase):
    """货物模型测试"""
    
    def setUp(self):
        """测试前准备"""
        self.category = Category.objects.create(name='办公用品')
        self.variety = Variety.objects.create(
            category=self.category,
            name='笔类'
        )
        self.unit = Unit.objects.create(name='支')
    
    def test_create_goods(self):
        """测试创建货物"""
        goods = Goods.objects.create(
            variety=self.variety,
            unit=self.unit,
            name='圆珠笔',
            code='YZB001',
            quantity=100,
            warning_threshold=10
        )
        
        self.assertEqual(goods.name, '圆珠笔')
        self.assertEqual(goods.quantity, 100)
        self.assertFalse(goods.is_warning)
    
    def test_goods_warning(self):
        """测试货物预警"""
        goods = Goods.objects.create(
            variety=self.variety,
            unit=self.unit,
            name='铅笔',
            code='QB001',
            quantity=5,
            warning_threshold=10
        )
        
        self.assertTrue(goods.is_warning)
    
    def test_goods_str(self):
        """测试货物字符串表示"""
        goods = Goods.objects.create(
            variety=self.variety,
            unit=self.unit,
            name='钢笔',
            code='GB001'
        )
        self.assertEqual(str(goods), '钢笔')


class UnitAPITest(APITestCase):
    """单位API测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = generate_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.url = '/api/units/'
    
    def test_list_units(self):
        """测试获取单位列表"""
        Unit.objects.create(name='千克', symbol='kg')
        Unit.objects.create(name='米', symbol='m')
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 2)
    
    def test_create_unit(self):
        """测试创建单位"""
        response = self.client.post(self.url, {
            'name': '升',
            'symbol': 'L',
            'description': '容量单位'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['name'], '升')
    
    def test_create_duplicate_unit(self):
        """测试创建重复单位"""
        Unit.objects.create(name='千克')
        
        response = self.client.post(self.url, {
            'name': '千克'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_update_unit(self):
        """测试更新单位"""
        unit = Unit.objects.create(name='千克', symbol='kg')
        
        response = self.client.put(f'{self.url}{unit.id}/', {
            'symbol': 'KG'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        unit.refresh_from_db()
        self.assertEqual(unit.symbol, 'KG')
    
    def test_delete_unit(self):
        """测试删除单位"""
        unit = Unit.objects.create(name='临时单位')
        
        response = self.client.delete(f'{self.url}{unit.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Unit.objects.filter(id=unit.id).exists())


class CategoryAPITest(APITestCase):
    """品类API测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = generate_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.url = '/api/categories/'
    
    def test_list_categories(self):
        """测试获取品类列表"""
        Category.objects.create(name='办公用品')
        Category.objects.create(name='电子设备')
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 2)
    
    def test_create_category(self):
        """测试创建品类"""
        response = self.client.post(self.url, {
            'name': '劳保用品',
            'code': 'LBYP'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertTrue(data['success'])


class GoodsAPITest(APITestCase):
    """货物API测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = generate_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        self.category = Category.objects.create(name='办公用品')
        self.variety = Variety.objects.create(
            category=self.category,
            name='笔类'
        )
        self.unit = Unit.objects.create(name='支')
        self.url = '/api/goods/'
    
    def test_list_goods(self):
        """测试获取货物列表"""
        Goods.objects.create(
            variety=self.variety,
            unit=self.unit,
            name='圆珠笔',
            code='YZB001'
        )
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('list', data['data'])
    
    def test_create_goods(self):
        """测试创建货物"""
        response = self.client.post(self.url, {
            'variety': self.variety.id,
            'unit': self.unit.id,
            'name': '钢笔',
            'code': 'GB001',
            'warning_threshold': 10
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertTrue(data['success'])


class StockInAPITest(APITestCase):
    """入库API测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = generate_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
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
            quantity=0
        )
        self.url = '/api/stock-in/'
    
    def test_stock_in(self):
        """测试入库"""
        response = self.client.post(self.url, {
            'goods': self.goods.id,
            'quantity': 100,
            'batch_no': 'BATCH001',
            'supplier': '供应商A'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 验证库存更新
        self.goods.refresh_from_db()
        self.assertEqual(self.goods.quantity, 100)
    
    def test_stock_in_invalid_quantity(self):
        """测试入库数量无效"""
        response = self.client.post(self.url, {
            'goods': self.goods.id,
            'quantity': -10
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class StockOutAPITest(APITestCase):
    """出库API测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = generate_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
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
        self.url = '/api/stock-out/'
    
    def test_stock_out_request(self):
        """测试出库申请"""
        response = self.client.post(self.url, {
            'goods': self.goods.id,
            'quantity': 10,
            'receiver': '张三',
            'receiver_dept': '办公室'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertEqual(data['data']['status'], 'pending')
    
    def test_stock_out_exceed_quantity(self):
        """测试出库数量超过库存"""
        response = self.client.post(self.url, {
            'goods': self.goods.id,
            'quantity': 200,
            'receiver': '张三'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ApprovalAPITest(APITestCase):
    """审批API测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = generate_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
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
        
        # 创建出库申请
        self.stock_out = StockOut.objects.create(
            goods=self.goods,
            operator=self.user,
            receiver='张三',
            quantity=10,
            status='pending'
        )
        self.approval = Approval.objects.create(
            stock_out=self.stock_out
        )
    
    def test_approve(self):
        """测试审批通过"""
        response = self.client.put(f'/api/approvals/{self.approval.id}/', {
            'action': 'approve',
            'remark': '同意'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 验证状态更新
        self.approval.refresh_from_db()
        self.assertEqual(self.approval.status, 'approved')
        
        # 验证库存扣减
        self.goods.refresh_from_db()
        self.assertEqual(self.goods.quantity, 90)
    
    def test_reject(self):
        """测试审批拒绝"""
        response = self.client.put(f'/api/approvals/{self.approval.id}/', {
            'action': 'reject',
            'remark': '库存不足'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 验证状态更新
        self.approval.refresh_from_db()
        self.assertEqual(self.approval.status, 'rejected')
        
        # 验证库存未变
        self.goods.refresh_from_db()
        self.assertEqual(self.goods.quantity, 100)

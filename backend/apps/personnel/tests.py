"""
人员管理模块测试用例
"""
from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.authentication.models import User
from apps.authentication.backends import generate_token
from .models import AttendancePerson, StockOutPerson


class AttendancePersonModelTest(TestCase):
    """考勤人员模型测试"""
    
    def test_create_attendance_person(self):
        """测试创建考勤人员"""
        person = AttendancePerson.objects.create(
            name='张三',
            employee_no='EMP001',
            department='办公室',
            position='职员',
            phone='13800138000'
        )
        
        self.assertEqual(person.name, '张三')
        self.assertEqual(person.employee_no, 'EMP001')
        self.assertTrue(person.is_active)
    
    def test_attendance_person_str(self):
        """测试考勤人员字符串表示"""
        person = AttendancePerson.objects.create(
            name='李四',
            employee_no='EMP002',
            department='财务部'
        )
        self.assertIn('李四', str(person))
        self.assertIn('EMP002', str(person))


class StockOutPersonModelTest(TestCase):
    """出库人员模型测试"""
    
    def test_create_stock_out_person(self):
        """测试创建出库人员"""
        person = StockOutPerson.objects.create(
            name='王五',
            employee_no='OUT001',
            department='仓库',
            position='仓管员'
        )
        
        self.assertEqual(person.name, '王五')
        self.assertEqual(person.department, '仓库')


class AttendancePersonAPITest(APITestCase):
    """考勤人员API测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = generate_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.url = '/api/attendance-persons/'
    
    def test_list_attendance_persons(self):
        """测试获取考勤人员列表"""
        AttendancePerson.objects.create(
            name='张三',
            employee_no='EMP001',
            department='办公室'
        )
        AttendancePerson.objects.create(
            name='李四',
            employee_no='EMP002',
            department='财务部'
        )
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['total'], 2)
    
    def test_create_attendance_person(self):
        """测试创建考勤人员"""
        response = self.client.post(self.url, {
            'name': '王五',
            'employee_no': 'EMP003',
            'department': '技术部',
            'position': '工程师',
            'phone': '13900139000'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['name'], '王五')
    
    def test_create_duplicate_employee_no(self):
        """测试创建重复工号"""
        AttendancePerson.objects.create(
            name='张三',
            employee_no='EMP001',
            department='办公室'
        )
        
        response = self.client.post(self.url, {
            'name': '李四',
            'employee_no': 'EMP001',
            'department': '财务部'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_update_attendance_person(self):
        """测试更新考勤人员"""
        person = AttendancePerson.objects.create(
            name='张三',
            employee_no='EMP001',
            department='办公室'
        )
        
        response = self.client.put(f'{self.url}{person.id}/', {
            'department': '技术部'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        person.refresh_from_db()
        self.assertEqual(person.department, '技术部')
    
    def test_delete_attendance_person(self):
        """测试删除考勤人员"""
        person = AttendancePerson.objects.create(
            name='临时人员',
            employee_no='TEMP001',
            department='临时'
        )
        
        response = self.client.delete(f'{self.url}{person.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(AttendancePerson.objects.filter(id=person.id).exists())
    
    def test_filter_by_department(self):
        """测试按部门筛选"""
        AttendancePerson.objects.create(
            name='张三',
            employee_no='EMP001',
            department='办公室'
        )
        AttendancePerson.objects.create(
            name='李四',
            employee_no='EMP002',
            department='技术部'
        )
        
        response = self.client.get(self.url, {'department': '办公室'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['data']['total'], 1)


class StockOutPersonAPITest(APITestCase):
    """出库人员API测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = generate_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.url = '/api/stock-out-persons/'
    
    def test_list_stock_out_persons(self):
        """测试获取出库人员列表"""
        StockOutPerson.objects.create(
            name='王五',
            employee_no='OUT001',
            department='仓库'
        )
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
    
    def test_create_stock_out_person(self):
        """测试创建出库人员"""
        response = self.client.post(self.url, {
            'name': '赵六',
            'employee_no': 'OUT002',
            'department': '仓库',
            'position': '仓管员'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

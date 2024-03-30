# Copyright (c) 2024, kaviraj P R and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class HealthcareRoles(Document):
    
	def create_designation(self):
		dest_name = frappe.db.get_list('Designation',{'name':self.role},['name'])
		print(("-")*20,dest_name)
		if self.status == "Active":
			if not dest_name:
				des_doc = frappe.new_doc("Designation")
				des_doc.designation_name = self.role
				des_doc.save()
				print("- - - - - --  - - - -  created ")
		elif self.dont_disable_user == 0 and self.status == "Inactive" and dest_name:
			des_doc_name = self.role  
			des_doc = frappe.get_doc("Designation", des_doc_name)
			if des_doc:
				frappe.delete_doc("Designation", des_doc_name)
			

	def inactivate_role_id(self):
		if self.dont_disable_user ==0:
			role_status = self.status
			emp_id_status = 1 if role_status == 'Active' else 0
			employee_doc_list = frappe.db.get_list("Employee",{'designation':self.role},["name"])
			if  employee_doc_list:
				for emp in employee_doc_list:
						emp_doc = frappe.get_doc("Employee",{"name":emp.name})
						emp_doc.status = role_status
						if emp_doc.user_id:
								user_doc = frappe.get_doc("User",{"email":emp_doc.user_id})
								user_doc.enabled = emp_id_status
								user_doc.save()
						emp_doc.save()
			
			frappe.msgprint("activation completed successfully") if self.status == 'Active' else frappe.msgprint("Inactivation completed successfully")
	def before_save(self):
		self.create_designation()
		self.inactivate_role_id()


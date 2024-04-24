# Copyright (c) 2024, kaviraj P R and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class HealthcareRoles(Document):
    
	def create_designation(self):
		dest_name = frappe.db.get_all('Designation',{'name':self.role},['name'])
		if self.status == "Active":
			if not dest_name:
				des_doc = frappe.new_doc("Designation")
				des_doc.designation_name = self.role
				des_doc.save()
		elif self.dont_disable_user == 0 and self.status == "Inactive" and dest_name:
			des_doc_name = self.role  
			des_doc = frappe.get_doc("Designation", des_doc_name)
			if des_doc:
				frappe.db.sql(f"DELETE FROM tabDesignation WHERE name = '{des_doc_name}'")
				frappe.db.commit()
    
	def create_role(self):
		role_name = frappe.db.get_all('Role',{'name':self.role},['name'])
		if self.status == "Active":
			if not role_name:
				role_doc = frappe.new_doc('Role')
				role_doc.role_name = self.role
				role_doc.save()
		elif self.dont_disable_user == 0 and self.status == "Inactive" and role_name:
				role_doc_name = self.role  
				des_doc = frappe.get_doc("Role", role_doc_name)
				if des_doc:
					frappe.db.sql(f"DELETE FROM tabRole WHERE name = '{role_doc_name}' ")

	def inactivate_role_id(self):
		if self.dont_disable_user ==0:
			role_status = self.status
			emp_id_status = 1 if role_status == 'Active' else 0
			employee_doc_list = frappe.db.get_list("Employee",{'designation':self.role},["name"])
			if  employee_doc_list:
				for emp in employee_doc_list:
						emp_doc = frappe.get_doc("Employee",{"name":emp.name})
						frappe.db.sql(f"UPDATE tabEmployee SET status = '{role_status}' WHERE name = '{emp.name}' ")
						frappe.db.commit()
						if emp_doc.user_id:
								user_doc = frappe.get_doc("User",{"email":emp_doc.user_id})
								user_doc.enabled = emp_id_status
								user_doc.save()
						
			frappe.msgprint("activation completed successfully") if self.status == 'Active' else frappe.msgprint("Inactivation completed successfully")
   
	def before_save(self):
		self.create_designation()
		self.inactivate_role_id()
		self.create_role()
  
	def after_insert(self):
		self.create_role()
		self.create_designation()
		
		
	


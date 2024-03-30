# Copyright (c) 2024, kaviraj P R and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import frappe.model.rename_doc

class HealthcarePractitioner(Document):
	# def full_name(self):
	# 	if self.first_name and self.last_name:
	# 			self.set("full_name",self.first_name+" "+self.last_name)
	# 	else:
	# 			self.set("full_name",self.first_name)
	


	def create_employee(self):
		try:
			employee_doc = frappe.new_doc("Employee")
			employee_doc.first_name = self.first_name
			employee_doc.last_name = self.last_name
			employee_doc.gender = self.gender
			employee_doc.date_of_birth = self.date_of_birth
			employee_doc.date_of_joining = self.date_of_joining
			employee_doc.designation = self.role
			employee_doc.save()
			frappe.db.commit()
			# frappe.rename_doc(self.doctype,self.name,employee_doc.name)
			# self.emp__id == employee_doc.name
			rename = frappe.db.sql(f"UPDATE `tabHealthcare Practitioner` SET name = '{employee_doc.name}',emp__id = '{employee_doc.name}' WHERE name = '{self.name}' ")
			frappe.db.commit()
			self.reload()
		except Exception as e:
			raise  
		


	def after_insert(self):
		self.create_employee()








@frappe.whitelist()
def active_role():
	active_role = frappe.db.get_list("Healthcare Roles",{'status':'Active'},['name'])
	if active_role:
		return [role.name for role in active_role ]
	else:
		return []
	
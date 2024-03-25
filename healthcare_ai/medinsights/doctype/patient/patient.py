# Copyright (c) 2024, kaviraj P R and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Patient(Document):
    
	def set_missing_values(self):
		#full name
		if self.patient_first_name and self.patient_last_name:
				self.set("patient_full_name",self.patient_first_name+" "+self.patient_last_name)
		else:
				self.set("patient_full_name",self.patient_first_name)
	
		#BMI
		if self.weight and self.height:
			bmi = self.weight / (self.height ** 2)
			if bmi < 18.5:
				self.set("bmi", "Underweight")
			elif 18.5 <= bmi < 24.9:
				self.set("bmi", "Normal weight")
			elif 25 <= bmi < 29.9:
				self.set("bmi", "Overweight")
			else:
				self.set("bmi", "Obesity")
   
	def create_patient_as_user(self):
		#create user 
		user_list = frappe.db.get_list("User",{},["email"])
		user_email_list = [i.email for i in user_list]
		if self.email_id not in user_email_list:
			if self.is_patient_user ==1:
				self.password = self.name
				print("- - - - - - -  - - - - ",self.password)
				user = frappe.new_doc("User")
				user.email = self.email_id
				user.first_name = self.patient_first_name
				user.enabled = 1
				user.save()
				role = frappe.get_doc("User",user.name)
				role.role_profile_name = "Patient"
				role.new_password = self.password
				role.save()
		else:
			frappe.msgprint("User Exits")
	
 

			
 
	def validate(self):
		self.set_missing_values()
	def before_submit(self):
		self.create_patient_as_user()



@frappe.whitelist()
def edit_user_permission(name,status):
    patient_details = frappe.db.get_list("Patient",{"name":name},['*'])
    if patient_details:
        patient_details_list = patient_details[0]
        user = frappe.get_doc('User',{"email":patient_details_list.email_id})
        if status =="Active":
            user.enabled = 1
            user.save()
            frappe.msgprint('patient ID Activated')
        else:
            user.enabled = 0
            user.save()
            frappe.msgprint('patient ID Inactivated')
         


    




      
      
      

# Copyright (c) 2024, kaviraj P R and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class DoctorAppointment(Document):
	def create_patient(self):
		patient_doc = frappe.new_doc('Patient')
		patient_doc.patient_first_name = self.name1
		patient_doc.mobile_number = self.phone_number
		patient_doc.save()
		patient_doc.submit()
		self.patient_id = patient_doc.name


	def check_alredy_exits(self):
		if not self.patient_id:
				user_exit = frappe.db.get_value('Patient',{'mobile_number':self.phone_number},'name')
				if user_exit:
						self.patient_id = user_exit
						setting = frappe.get_single('MedInsights Settings')
						if setting.appointment_user_exits_pop_up == 1:
								frappe.msgprint(f'Patient exits with ID {user_exit} ')
				else:
						self.create_patient()
	
	def generate_token_number(self):
		setting = frappe.get_single('MedInsights Settings')
		if setting.token_rest_based_on ==1:
			if setting.appointment_based_on == 'Ward Number':
					token_number_query = frappe.db.sql(f"SELECT token_number FROM `tabDoctor Appointment` WHERE ward_number ='{self.ward_number}' and DATE(creation)=CURDATE( ) ORDER BY name DESC LIMIT 1 ",as_dict = True)
					self.token_number = 1 if not token_number_query else token_number_query[0].token_number + 1
			elif setting.appointment_based_on == 'Doctor':
					token_number_query = frappe.db.sql(f"SELECT token_number FROM `tabDoctor Appointment` WHERE doctor ='{self.doctor}' and DATE(creation)=CURDATE( ) ORDER BY name DESC LIMIT 1 ",as_dict = True)
					self.token_number = 1 if not token_number_query else token_number_query[0].token_number + 1
			elif setting.appointment_based_on == 'Overall':
					token_number_query = frappe.db.sql(f"SELECT token_number FROM `tabDoctor Appointment` WHERE DATE(creation)=CURDATE( ) ORDER BY name DESC LIMIT 1 ",as_dict = True)
					self.token_number = 1 if not token_number_query else token_number_query[0].token_number + 1

	def before_save(self):
		self.check_alredy_exits()
		self.generate_token_number()
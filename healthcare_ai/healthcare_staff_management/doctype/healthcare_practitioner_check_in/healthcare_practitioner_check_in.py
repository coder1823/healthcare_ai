# Copyright (c) 2024, kaviraj P R and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class HealthcarePractitionerCheckIn(Document):
		pass

@frappe.whitelist(allow_guest=True)
def check_in_out(user,type):
	emp_doc = frappe.get_doc("Employee",{'user_id':user})
	log_type = 'In' if type == 'in' else 'Out'
	if emp_doc.name:
		check_in_doc = frappe.new_doc('Check In and out')
		check_in_doc.practitioner_id = emp_doc
		check_in_doc.date = frappe.utils.now_datetime().date()
		check_in_doc.time = frappe.utils.now_datetime().time()
		check_in_doc.date_and_time = frappe.utils.now_datetime()
		check_in_doc.log_inout = log_type
		check_in_doc.save()
		if emp_doc.designation == 'Doctor' and type == 'in':
			dr_availability = frappe.get_single('Doctor Availability')
			dr_availability.append('availablity_reference',{
				'doctor_id':emp_doc.name,
				'specialization':emp_doc.specialization,
				'ward_number':emp_doc.ward_number,
				'availability':'Available',
				'doctor':emp_doc.employee_name
			})
			dr_availability.save()
			return 'check_in'

		elif emp_doc.designation == 'Doctor' and type == 'out':
			frappe.db.sql(f"DELETE FROM  `tabDoctor availablity reference` WHERE doctor_id = '{emp_doc.name}' ")
			frappe.db.commit()
			return 'check_out'

		
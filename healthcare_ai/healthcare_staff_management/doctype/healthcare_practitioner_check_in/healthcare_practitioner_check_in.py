# Copyright (c) 2024, kaviraj P R and contributors
# For license information, please see license.txt

import frappe
import math
from frappe.model.document import Document

class HealthcarePractitionerCheckIn(Document):
		pass

import frappe

@frappe.whitelist()
def check_in_out(log_type,emp_longitude,emp_latitude):
	setting_doc = frappe.get_single("MedInsights Settings")
	if setting_doc:
		branch_latitude = setting_doc.latitude
		branch_longitude = setting_doc.longitude
		branch_range = setting_doc.range
	else:
		frappe.throw("Please Setup the Meta Date")
  
	R = 6371
	emp_latitude = float(emp_latitude)
	emp_longitude = float(emp_longitude)
	branch_latitude = float(branch_latitude)
	branch_longitude = float(branch_longitude)
	

	# Convert coordinates to radians
	φ1 = emp_latitude * math.pi / 180
	φ2 = branch_latitude * math.pi / 180
	Δφ = (branch_latitude - emp_latitude) * math.pi / 180
	Δλ = (branch_longitude - emp_longitude) * math.pi / 180

	# Haversine formula
	a = math.sin(Δφ / 2) * math.sin(Δφ / 2) + \
		math.cos(φ1) * math.cos(φ2) * \
		math.sin(Δλ / 2) * math.sin(Δλ / 2)
	c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

	# Calculate distance in kilometers
	distance = R * c
 
	if distance is not None:
	# Check if custom_range_str is not an empty string
		if branch_range:
			try:
				custom_range = float(branch_range)
			except ValueError:
				frappe.msgprint("Invalid Range value. Please provide a valid Range.")
				return distance
		else:
			frappe.msgprint("Range value is empty. Please provide a valid Range.")
			return distance

		if distance > custom_range:
#                 frappe.msgprint(_('You are {0} kilometers away. You cannot punch.'.format(round(distance, 2))))   

			frappe.msgprint('<div style="color: red; font-size: 15px;">&#10060; Not in Range.</div>'.format(round(distance, 2)));
			return distance,"Not In Range"
		
		else:
			formatted_distance = round(distance, 2)
		user = frappe.session.user
		emp_doc = frappe.get_doc("Employee",{'user_id':user})
		if emp_doc.name:
			check_in_doc = frappe.new_doc('Check In and out')
			check_in_doc.practitioner_id = emp_doc
			check_in_doc.date = frappe.utils.now_datetime().date()
			check_in_doc.time = frappe.utils.now_datetime().time()
			check_in_doc.date_and_time = frappe.utils.now_datetime()
			check_in_doc.log_inout = log_type
			check_in_doc.save()
			if emp_doc.designation == 'Doctor' and log_type == 'IN':
				dr_availability = frappe.get_single('Doctor Availability')
				dr_availability.append('availablity_reference',{
					'doctor_id':emp_doc.name,
					'specialization':emp_doc.specialization,
					'ward_number':emp_doc.ward_number,
					'availability':'Available',
					'doctor':emp_doc.employee_name
				})
				dr_availability.save()
				

			elif emp_doc.designation == 'Doctor' and log_type == 'OUT':
				frappe.db.sql(f"DELETE FROM  `tabDoctor availablity reference` WHERE doctor_id = '{emp_doc.name}' ")
				frappe.db.commit()
			
			try:
				

				# Display success message based on log_type
				if log_type == 'IN':
					# frappe.msgprint('<div style="color: green; font-size: 15px;">&#10004;&nbsp;&nbsp; You are in {0} kilometers. Successfully Punch IN.</div>'.format(round(distance, 2)));
					# frappe.msgprint('<div style="color: green; font-size: 15px;">&#10004;&nbsp;&nbsp;Punch IN Success.</div>'.format(round(distance, 2))) 
					message_success_in = f"""
													<div class="wrapper" style="background-color: white; display: flex; align-items: center;">

<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
	<circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
	
	<path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
	
</svg>
<p style="font-size: 18px; color: green; margin-right: 10px;">Punch In Success</p>
</div>
													"""
												
												
					css_style_error = """
								<style>
.checkmark__circle {
stroke-dasharray: 166;
stroke-dashoffset: 166;
stroke-width: 2;
stroke-miterlimit: 10;
stroke: #7ac142;
fill: none;
animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark {
width: 56px;
height: 56px;
border-radius: 50%;
display: block;
stroke-width: 2;
stroke: #fff;
stroke-miterlimit: 10;
margin: 5%;
box-shadow: inset 0px 0px 0px #7ac142;
animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
}

.checkmark__check {
transform-origin: 50% 50%;
stroke-dasharray: 48;
stroke-dashoffset: 48;
animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
100% {
	stroke-dashoffset: 0;
}
}

@keyframes scale {
0%, 100% {
	transform: none;
}
50% {
	transform: scale3d(1.1, 1.1, 1);
}
}

@keyframes fill {
100% {
	box-shadow: inset 0px 0px 0px 30px #7ac142;
}
}
</style>
								"""
				# Combine CSS and HTML for the frappe.msgprint
					full_message_success_in = css_style_error + message_success_in

					# Display the success message
					frappe.msgprint(full_message_success_in)
				elif log_type == 'OUT':
					message_success_out = f"""
												<div class="wrapper" style="background-color: white; display: flex; align-items: center;">

<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
<circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>

<path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>

</svg>
<p style="font-size: 18px; color: green; margin-right: 10px;">Punch Out Success</p>
</div>
												"""
					css_style_error = """
								<style>
.checkmark__circle {
stroke-dasharray: 166;
stroke-dashoffset: 166;
stroke-width: 2;
stroke-miterlimit: 10;
stroke: #7ac142;
fill: none;
animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark {
width: 56px;
height: 56px;
border-radius: 50%;
display: block;
stroke-width: 2;
stroke: #fff;
stroke-miterlimit: 10;
margin: 5%;
box-shadow: inset 0px 0px 0px #7ac142;
animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
}

.checkmark__check {
transform-origin: 50% 50%;
stroke-dasharray: 48;
stroke-dashoffset: 48;
animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
100% {
	stroke-dashoffset: 0;
}
}

@keyframes scale {
0%, 100% {
	transform: none;
}
50% {
	transform: scale3d(1.1, 1.1, 1);
}
}

@keyframes fill {
100% {
	box-shadow: inset 0px 0px 0px 30px #7ac142;
}
}
</style>
								"""
					full_message_success_out = css_style_error + message_success_out
				# frappe.msgprint(_('You are in {0} kilometers. Successfully Punch OUT.'.format(round(distance, 2))))
					frappe.msgprint(full_message_success_out) 
				else:
					frappe.msgprint("Unknown log type. Please provide a valid log type.")
			except frappe.exceptions.ValidationError:
				frappe.msgprint("Check-in failed. Please try again.")

	else:
		frappe.msgprint("Please contact the administrator.")
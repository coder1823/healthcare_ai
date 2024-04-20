# Copyright (c) 2024, kaviraj P R and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from healthcare_ai.hidden_field import error_log
from translate import Translator




class Consultation(Document):
	pass

def check_status_wise_count(status,query):
        if query:
            doctor_appointment_doc = frappe.db.sql(f"SELECT COUNT(name) AS count FROM `tabDoctor Appointment` WHERE DATE(creation)=CURDATE( ) AND status = '{status}' {query} ",as_dict = True )
            return (doctor_appointment_doc[0].count)

def total_count(query):
    if query:
        doctor_appointment_doc = frappe.db.sql(f"SELECT COUNT(name) AS count FROM `tabDoctor Appointment` WHERE  DATE(creation)=CURDATE( )   {query} ",as_dict = True )
        return (doctor_appointment_doc[0].count)

def update_monitorization_count(count,fieldname):
    frappe.db.sql(f"UPDATE `tabConsultation` set {fieldname} = '{count}' ")
    frappe.db.commit()
    
@frappe.whitelist()
def get_monetization_count(doctor_id=None):
    medinsights_setting = frappe.get_single('MedInsights Settings')
    ward_number = frappe.db.get_value('Employee',{'user_id':frappe.session.user},'ward_number')
    if doctor_id:
        if medinsights_setting.appointment_based_on == 'Doctor':
            update_monitorization_count(check_status_wise_count('Waiting for consultation',f"AND doctor = '{doctor_id}'"),'waiting_count')
            update_monitorization_count(check_status_wise_count('Consultation Completed',f"AND doctor = '{doctor_id}'"),'completed_count')
            update_monitorization_count(check_status_wise_count('Consultation Completed',f"AND doctor = '{doctor_id}'"),'cancelled_count')
            update_monitorization_count(total_count(f"AND doctor = '{doctor_id}'"),'total_count')
    elif medinsights_setting.appointment_based_on == 'Ward Number':
        if ward_number:
            update_monitorization_count(check_status_wise_count('Waiting for consultation',f"AND ward_number = '{ward_number}'"),'waiting_count')
            update_monitorization_count(check_status_wise_count('Consultation Completed',f"AND ward_number = '{ward_number}'"),'completed_count')
            update_monitorization_count(check_status_wise_count('Consultation Completed',f"AND ward_number = '{ward_number}'"),'cancelled_count')
            update_monitorization_count(total_count(f"AND ward_number = '{ward_number}' "),'total_count')
                
        return 'update total'
    
def translate_en_tn(text):
        translator = Translator(to_lang="ta")
        translation = translator.translate(text)
        return translation
    
def next_appt(query):
        try:
            query_list = frappe.db.sql(f"SELECT * FROM `tabConsultation` WHERE {query} AND DATE(creation)=CURDATE( ) AND status ='' ORDER BY token_number ASC LIMIT 1",as_dict = True)
            if query_list:
                appt_doc = frappe.get_all('Doctor Appointment',{'name':query_list[0].prescription_id},'*')
                return query_list[0].name,(f"Token number {query_list[0].token_number} come inside")
        except Exception as e:
            error_log('Consultation','next_appt',e)
  
@frappe.whitelist()
def get_next_appt(ward_number=None,doctor_id=None):
    settings = frappe.get_single('MedInsights Settings')
    if settings.appointment_based_on == 'Ward Number' and ward_number:
        return next_appt(f"ward_number = '{ward_number}'")
    elif settings.appointment_based_on == 'Doctor' and doctor_id:
        return next_appt(f"doctor_id='{doctor_id}' ")
        

    
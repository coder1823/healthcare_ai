import frappe


def error_log(doctype,title,error):
    error_log = frappe.new_doc('Error Log')
    try:
        error_log.reference_docType = doctype
        error_log.method = title
        error_log.error = error
    except Exception as e:
        error_log.error = e
        
    error_log.save()
    
@frappe.whitelist()
def get_field_list():
    med_setting = frappe.get_single('MedInsights Settings')
    field_list = {'system_used_by':med_setting.system_used_by,'dr_allocation':med_setting.dr_allocation_based_on_ward,'patient_monitorization':med_setting.show_patient_monitorization
                  ,'appointment_based_on':med_setting.appointment_based_on}
    return field_list


@frappe.whitelist()
def get_specialization_name(ward_number):
    if ward_number:
        specialization_name =frappe.db.get_value('Healthcare Specializations', {'ward_number':ward_number},'specialization_name')
        return specialization_name if specialization_name else ''
        
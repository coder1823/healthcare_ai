import frappe 

#listing ward number
@frappe.whitelist()
def get_ward_numbers():
    ward_number = frappe.db.sql("SELECT ward_number FROM `tabHealthcare Specializations` WHERE is_admission_ward = 1  ",as_dict = True)
    return [i.ward_number for i in ward_number] if ward_number else []


def check_status_count(status,ward_number):
    status_count = frappe.db.sql(f"SELECT count(name) AS count FROM `tabIn Patient Management` WHERE status = '{status}' AND ward_number = '{ward_number}' ",as_dict = True)
    return status_count[0].count if status_count else 0 



@frappe.whitelist()
def get_count(ward_number):
    if ward_number:
        total_beds = frappe.db.get_value('Healthcare Specializations',{'ward_number':ward_number},'maxium_admission')
        occupied_beds = check_status_count('Admitted',ward_number)
        available_beds = total_beds - occupied_beds
        return {'total_beds':total_beds,'occupied_beds':occupied_beds,'available_beds':available_beds}


#available bed list
@frappe.whitelist()
def get_available_bed(ward_number):
    if ward_number:
        total_beds = frappe.db.get_value('Healthcare Specializations',{'ward_number':ward_number},'maxium_admission')
        occupied_bed_numbers_query = frappe.db.sql(f"SELECT bed_number FROM `tabIn Patient Management` WHERE status = 'Admitted' AND ward_number = '{ward_number}' ",as_dict = True)
        if len(occupied_bed_numbers_query) !=0:
            occupied_bed_numbers_list = [i.bed_number for i in occupied_bed_numbers_query]
            available_bed_number = []
            for i in range(1,total_beds+1):
                if i not in occupied_bed_numbers_list:
                    available_bed_number.append(i) 
            return available_bed_number
        else:
            return [i for i in range(1,total_beds+1)]
        
@frappe.whitelist()
def get_occupied_beds(ward_number):
    if ward_number:
        admitted_bed_list = frappe.db.sql(f"SELECT * FROM `tabIn Patient Management` WHERE status = 'Admitted' and ward_number = '{ward_number}' ",as_dict = True)
        if admitted_bed_list:
            return admitted_bed_list
            
        
#waiting for admission list 
@frappe.whitelist()
def get_waiting_patient(ward_number):
    if ward_number:
        patient_details = frappe.db.sql(f"SELECT patient_id,patient_name FROM `tabIn Patient Management` WHERE ward_number = '{ward_number}' AND status = 'Waiting' ",as_dict = True)
        if patient_details:
            return patient_details


#updating IN patient status
@frappe.whitelist()
def update_patient_status(bed_number,patient_id):
    if patient_id and bed_number:
        ip_doc = frappe.get_doc('In Patient Management',{'patient_id':patient_id,'status':'Waiting'})
        ip_doc.status = 'Admitted'
        ip_doc.bed_number = bed_number
        ip_doc.admitted_on = frappe.utils.now_datetime()
        ip_doc.save()
        frappe.db.commit()
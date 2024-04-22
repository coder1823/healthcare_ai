import frappe 

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

@frappe.whitelist()
def get_available_bed(ward_number):
    if ward_number:
        total_beds = frappe.db.get_value('Healthcare Specializations',{'ward_number':ward_number},'maxium_admission')
        occupied_bed_numbers_query = frappe.db.sql(f"SELECT bed_number FROM `tabIn Patient Management` WHERE status = 'Admitted' AND ward_number = '{ward_number}' ",as_dict = True)
        if len(occupied_bed_numbers_query) !=0:
            print("----------------------its me --------------------------------")
            occupied_bed_numbers_list = [i.bed_number for i in occupied_bed_numbers_query]
            available_bed_number = []
            for i in range(1,total_beds+1):
                if i not in occupied_bed_numbers_list:
                    available_bed_number.append(i) 
            return available_bed_number
        else:
            print("----------------------its me elses --------------------------------", len(occupied_bed_numbers_query))
            print((occupied_bed_numbers_query))
            return [i for i in range(1,total_beds+1)]
                
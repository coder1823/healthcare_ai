import frappe

@frappe.whitelist()
def get_field_list():
    med_setting = frappe.get_single('MedInsights Settings')
    field_list = {'system_used_by':med_setting.system_used_by,'dr_allocation':med_setting.dr_allocation_based_on_ward
                  }
    return field_list
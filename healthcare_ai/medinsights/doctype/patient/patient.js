// Copyright (c) 2024, kaviraj P R and contributors
// For license information, please see license.txt




frappe.ui.form.on('Patient',{
    patient_status:function(frm){
        if (frm.doc.name){
        frappe.call({
            
            'method':'healthcare_ai.medinsights.doctype.patient.patient.edit_user_permission',
            args:{
                "name":frm.doc.name,
                "status":frm.doc.patient_status
            }
        })
    }
    }
})
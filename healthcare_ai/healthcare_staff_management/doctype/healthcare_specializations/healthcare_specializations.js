// Copyright (c) 2024, kaviraj P R and contributors
// For license information, please see license.txt

frappe.ui.form.on('Healthcare Specializations', {
	refresh: function(frm) {
		frappe.call({
            method: 'healthcare_ai.hidden_field.get_field_list',
            callback:function(r){
                if (r.message){
                    if (r.message['dr_allocation'] == 'No') {
                        frm.toggle_display('ward_number',0)
                    }
                    
                }
            }
        })
	}
});

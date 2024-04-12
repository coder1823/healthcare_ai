// Copyright (c) 2024, kaviraj P R and contributors
// For license information, please see license.txt

frappe.ui.form.on('Healthcare Practitioner Check In', {
	// refresh: function(frm) {

	// }
});
frappe.ui.form.on('Healthcare Practitioner Check In', {
    refresh: function(frm) {
        frm.fields_dict.check_in.$input.css({'font-size': '16px',
                                            "text-align":"center",
                                            "background-color": "#42a5fc",
                                            "color":"white",
                                            "height": "40px",
                                            "width": "150px",
                                            "margin": "0 auto",
                                            "display": "block"});

        frm.fields_dict.check_out.$input.css({'font-size': '16px',
                                            "text-align":"center",
                                            "background-color": "#42a5fc",
                                            "color":"white",
                                            "height": "40px",
                                            "width": "150px",
                                            "margin": "0 auto",
                                            "display": "block"});
    },
	check_in:function(frm){
		frappe.call({		
			method:'healthcare_ai.healthcare_staff_management.doctype.healthcare_practitioner_check_in.healthcare_practitioner_check_in.check_in_out',
			args:{
				"user":frappe.session.user,
				"type":"in"
			},callback:function(r){
				if (r.message == "check_in"){
					frappe.msgprint("punched in successfully")
					frm.refresh()
				}
			}
	})
	},
	check_out:function(frm){
		frappe.call({		
			method:'healthcare_ai.healthcare_staff_management.doctype.healthcare_practitioner_check_in.healthcare_practitioner_check_in.check_in_out',
			args:{
				"user":frappe.session.user,
				"type":"out"
			},callback:function(r){
				if (r.message == "check_out"){
					frappe.msgprint("punched out successfully")
					frm.refresh()
				}
			}
	})
	}
});
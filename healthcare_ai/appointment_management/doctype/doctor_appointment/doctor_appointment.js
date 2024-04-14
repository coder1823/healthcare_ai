// Copyright (c) 2024, kaviraj P R and contributors
// For license information, please see license.txt

frappe.ui.form.on('Doctor Appointment', {
	refresh: function(frm) {
		frappe.call({
			method:'healthcare_ai.appointment_management.doctype.doctor_appointment.doctor_appointment.available_doctor_list',
			callback:function(r){
			if (r.message) {
				var doctor_list = r.message;
				frm.set_query("doctor", function() {
					return {
						filters: {
							name: ['in', doctor_list]
						}
					};
				});
			}
			}
		})
		if (frm.doc.status == 'Waiting for consultation'){
			frm.add_custom_button(__("Cancel Appointment"), function() {
				frm.set_value('status','Cancelled')
				frm.save()
			})
			
		}
	}

});

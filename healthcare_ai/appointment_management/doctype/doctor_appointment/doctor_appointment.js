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
		frappe.call({
			method:'healthcare_ai.hidden_field.get_field_list',
			callback:function(r){
				if(r.message['appointment_based_on']=='Ward Number'){
						frm.toggle_display('doctor',0)
				}
			}
		})
		frm.fields_dict.new_token.$input.css({'font-size': '16px',
		"text-align":"center",
		"background-color": "#42a5fc",
		"color":"white",
		"height": "40px",
		"width": "150px",
		"margin": "0 auto",
		"display": "block"});
	},
	ward_number:function(frm){
		frappe.call({
			method:'healthcare_ai.hidden_field.get_specialization_name',
			args:{
				'ward_number':frm.doc.ward_number
			},callback:function(r){
				if(r.message){
					frm.set_value('specialization',r.message)
				}
			}
		})
},
	new_token:function(frm){
		location.replace(`${origin}/app/doctor-appointment/new-doctor-appointment-dusknawkg`)
	}
});

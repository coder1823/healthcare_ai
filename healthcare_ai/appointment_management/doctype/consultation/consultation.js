// Copyright (c) 2024, kaviraj P R and contributors
// For license information, please see license.txt


function textToTamilSpeech(text) {
	const utterance = new SpeechSynthesisUtterance();
	utterance.lang = 'ta-IN'; // Tamil language code
	utterance.text = text;
	window.speechSynthesis.speak(utterance);
  }

frappe.ui.form.on('Consultation', {
	refresh: function(frm) {
		if (!frm.doc.status){
		frm.set_value('status','consulting')
		frm.save()
		}
		frm.add_custom_button(__("Next"),function(){
			if(frm.doc.status == 'consulting'){
				frm.set_value('status','Completed')
				frappe.call({ method: "frappe.client.get_value", async:false, args:{ doctype:'Employee', filters:{ user_id:frappe.session.user }, fieldname:['name'] }
				,callback:function (r) { 
					if(r.message != undefined){ 
						frm.set_value('doctor_id',r.message)
					}
					 } });
					 frm.save()
			}
			frappe.call({
				'method':'healthcare_ai.appointment_management.doctype.consultation.consultation.get_next_appt',
				args:{
					'ward_number':frm.doc.ward_number,
					'doctor_id':frm.doc.doctor_id
				},callback:function(r){
					if (r.message){
						textToTamilSpeech(`${r.message[1]}`)
						location.replace(`${origin}/app/consultation/${r.message[0]}`)
					}

				}
			})
		}),
		frm.add_custom_button(__("Recall"),function(){
			textToTamilSpeech(`Token Number ${frm.doc.token_number} Come inside`)
		})

		frappe.call({
			method:'healthcare_ai.appointment_management.doctype.consultation.consultation.get_monetization_count',
			args:{
				'doctor_id':frm.doc.doctor_id
			},callback:function(r){
				if (r.message == 'update total'){
					
				}
			}
		})
		frappe.call({
			method:'healthcare_ai.hidden_field.get_field_list',
			callback:function(r){
				if (r.message['patient_monitorization']==0){
					frm.toggle_display('section_break_fdkjc',0)
					
				}
			}
		})
	},
	transfer_ward_number:function(frm){
		
			frappe.call({
				method:'healthcare_ai.hidden_field.get_specialization_name',
				args:{
					'ward_number':frm.doc.transfer_ward_number
				},callback:function(r){
					if(r.message){
						frm.set_value('specialization',r.message)
					}
				}
			})
			
		

	}
});

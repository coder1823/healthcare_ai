// Copyright (c) 2024, kaviraj P R and contributors
// For license information, please see license.txt

var longitude;
var latitude;
var result;

frappe.ui.form.on('Healthcare Practitioner Check In', {
    onload_post_render: function (frm) {
        frm.disable_save();

        frm.fields_dict.check_in.$input.css({
            'font-size': '16px',
            'text-align': 'center',
            'background-color': '#42a5fc',
            'color': 'white',
            'height': '40px',
            'width': '150px',
            'margin': '40px auto 100px',  // Added margin at the bottom
            'display': 'block',
        });

        frm.fields_dict.check_out.$input.css({
            'font-size': '16px',
            'text-align': 'center',
            'background-color': '#42a5fc',
            'color': 'white',
            'height': '40px',
            'width': '150px',
            'margin': '10px auto 0',  // Added margin at the top
            'display': 'block',
        });

        function handleButtonClick(logType) {
            function onPositionReceived(position) {
                longitude = position.coords.longitude;
                latitude = position.coords.latitude;
                disableButtons();
                playClickSound();
                frappe_call(logType, frm); 
            }

            function locationNotReceived(positionError) {
                console.log(positionError);
            }

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(onPositionReceived, locationNotReceived, { enableHighAccuracy: true });
            }
        }

        function disableButtons() {
            frm.fields_dict.check_in.$input.prop('disabled', true);
            frm.fields_dict.check_out.$input.prop('disabled', true);

            setTimeout(function () {
                frm.fields_dict.check_in.$input.prop('disabled', false);
                frm.fields_dict.check_out.$input.prop('disabled', false);
            }, 5000); // Enable buttons after 5 seconds
        }

        function playClickSound() {
            
            frappe.utils.play_sound('submit');
        }

        frm.fields_dict.check_in.$input.on('click', function () {
            handleButtonClick('IN');
        });

        frm.fields_dict.check_out.$input.on('click', function () {
            handleButtonClick('OUT');
        });
    },
});



function playClickSound() {
    frappe.utils.play_sound('submit'); 
}
function frappe_call(logType, frm) { 
    frappe.call({
        method: 'healthcare_ai.healthcare_staff_management.doctype.healthcare_practitioner_check_in.healthcare_practitioner_check_in.check_in_out',
        args: {
            log_type: logType,
            emp_longitude: longitude,
            emp_latitude: latitude
        },
        callback: function (response) {
            if (response.message) {
                result = response.message;
                frm.set_value('distance_in_km', parseFloat(result).toFixed(2));
                console.log("checkin",result[2]);
                if (result[2]) {
                    let itemShow = [].concat(result[2]);
                    showLocationDialog(itemShow, logType, frm); // Pass frm as a parameter
                }
            }
        }
    });
}

function showLocationDialog(itemShow, logType, frm) { // Add frm as a parameter
    let d = new frappe.ui.Dialog({
        title: 'Enter details',
        fields: [
            {
                label: 'Please select your Sign In Location ',
                fieldname: 'Location',
                fieldtype: 'Select',
                options: itemShow
            },
        ],
        primary_action_label: 'Submit',
        primary_action(values) {
            console.log(values);
            frappe.call({
                method: 'healthcare_ai.healthcare_staff_management.doctype.healthcare_practitioner_check_in.healthcare_practitioner_check_in.remote_loaction_mark',
                args: {
                    log_type: logType,
                    emp_longitude: longitude,
                    emp_latitude: latitude,
                    device_id: values
                },
                callback: function (r) {
                    console.log(r.message)
                    playClickSound()
                }
            });

            d.hide();
        }
    });

    d.show();
}


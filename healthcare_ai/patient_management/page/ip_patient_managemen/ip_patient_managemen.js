var ward_number = 0
frappe.pages['ip-patient-managemen'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'In Patient Management Dashboard',
		single_column: true
	});

	function renderSummaryCards(occupied_beds, available_beds, total_beds) {
		let htmlContent = `
			<div class="dashboard">
				<div class="row">
					<div class="card" id="card1" onclick="OccupiedBeds();">
						<b><font size="4.5"><center>Occupied Beds</center></font></b>
						<div id="load0" class="number">
							<b><font size="7"><center>${occupied_beds}</center></font></b>
						</div>
					</div>
					<div class="card" id="card2" onclick="AvailableBed();">
						<b><font size="4.5"><center>Available Beds</center></font></b>
						<div id="load1" class="number">
							<b><font size="7"><center>${available_beds}</center></font></b>
						</div>
					</div>
					<div class="card" id="card3" onclick="hidePageAndShowHello();">
						<b><font size="4.5"><center>Total Beds</center></font></b>
						<div id="load2" class="number">
							<b><font size="7"><center>${total_beds}</center></font></b>
						</div>
					</div>
				</div>
			</div>`;
		return htmlContent;
	}
	function fetchWardSummary(selectedWard) {
		frappe.call({
			method: 'healthcare_ai.patient_management.page.ip_patient_managemen.ip_patient_managemen.get_count',
			args: { ward_number: selectedWard },
			callback: function(r) {
				if (!r.exc && r.message) {
					let htmlContent = renderSummaryCards(r.message['occupied_beds'], r.message['available_beds'], r.message['total_beds']);
					$('#summary-container').html(htmlContent).removeClass('hidden');
				} else {
					$('#summary-container').addClass('hidden');
				}
			}
		});
	}

	var ward_number_field = page.add_field({
		fieldname: 'ward_number',
		label: __('Ward Number'),
		fieldtype: 'Select',
		reqd: true
	});
	frappe.call({
		method: 'healthcare_ai.patient_management.page.ip_patient_managemen.ip_patient_managemen.get_ward_numbers',
		callback: function(r) {
			if (!r.exc && r.message) {
				ward_number_field.df.options = r.message.join('\n');
				ward_number_field.refresh();
			}
		}
	});

	ward_number_field.$input.on('change', function() {
		var selectedWard = ward_number_field.get_value();
		if (selectedWard) {
			ward_number = selectedWard
			fetchWardSummary(selectedWard);
		} else {
			$('#summary-container').addClass('hidden');
		}
	});

	page.main.append('<div id="summary-container" class="hidden"></div>');
	applyCardStyles();
    

}
function OccupiedBeds() {
    frappe.call({
        method: 'healthcare_ai.patient_management.page.ip_patient_managemen.ip_patient_managemen.get_occupied_beds',
        args: {
            'ward_number': ward_number
        },
        callback: function(r) {
            if (r.message) {
                var occupied_bed_list = r.message;
                var bedIconsHtml = '<style>';
                bedIconsHtml += `
                    .bed-container {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        padding: 20px;
                        background: #f8f9fa; /* Soft background that matches Frappe's UI */
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1); /* Subtle shadow for depth */
                    }
                    .bed-row {
                        display: flex;
                        justify-content: center;
                        width: 100%;
                        margin-bottom: 20px;
                    }
                    .bed-icon {
                        cursor: pointer;
                        text-align: center;
                        margin: 5px;
                        transition: transform 0.3s ease;
                        width: calc(20% - 10px); /* 20% for 5 beds in a row with 10px margin */
                        background: white; /* Bright contrast for better visibility */
                        border-radius: 4px; /* Rounded corners */
                        box-shadow: 0 2px 5px rgba(0,0,0,0.15); /* Smooth shadow for 3D effect */
                        position: relative; /* Position relative for pseudo-element */
                        overflow: hidden; /* Hide overflow content */
                    }
                    .bed-icon:hover {
                        transform: translateY(-5px); /* Lifting effect on hover */
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2); /* Deeper shadow on hover for a "raised" effect */
                    }
                    .bed-icon img {
                        width: 100%;
                        border-top-left-radius: 4px; /* Rounded corners for image */
                        border-top-right-radius: 4px;
                    }
                    .bed-icon span {
                        display: block;
                        margin-top: 5px;
                        color: #333; /* Dark color for text for readability */
                        padding: 5px;
                        position: absolute; /* Position absolute for fixed position */
                        bottom: 0; /* Align at the bottom */
                        left: 0; /* Align at the left */
                        width: 100%; /* Full width */
                        background-color: rgba(255, 255, 255, 0.8); /* Semi-transparent white background */
                        font-size: 12px;
                    }
                    .search-bar {
                        width: 100%;
                        padding: 10px;
                        margin-bottom: 20px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        box-sizing: border-box;
                    }
                `;
                bedIconsHtml += '</style><div class="bed-container">';
                


                for (var i = 0; i < occupied_bed_list.length; i++) {
                    if (i % 5 === 0 && i !== 0) {
                        bedIconsHtml += '</div><div class="bed-row">';
                    }
                    bedIconsHtml += `
                        <div class="bed-icon" onclick="showBedDetails('${occupied_bed_list[i].bed_number}')">
                            <img src="/files/bed_icon.png" alt="Bed Icon"/>
                            <span>Bed ${occupied_bed_list[i].bed_number}</span>
                            <span>Bed ${occupied_bed_list[i].bed_number} [${occupied_bed_list[i].patient_name} - ${occupied_bed_list[i].patient_id}]</span>
                        </div>
                    `;
                }
                if (occupied_bed_list.length % 5 !== 0) {
                    bedIconsHtml += '</div>';
                }

                bedIconsHtml += '</div>';
                document.getElementById('summary-container').innerHTML = bedIconsHtml;
                document.getElementById('summary-container').classList.remove('hidden');
            }
        }
    });
}

function AvailableBed() {
    frappe.call({
        method: 'healthcare_ai.patient_management.page.ip_patient_managemen.ip_patient_managemen.get_available_bed',
        args: {
            'ward_number': ward_number
        },
        callback: function(r) {
            if (r.message) {
                var ava_bed_list = r.message;
                var bedIconsHtml = '<style>';
                bedIconsHtml += `
                    .bed-container {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        padding: 20px;
                        background: #f8f9fa; /* Soft background that matches Frappe's UI */
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1); /* Subtle shadow for depth */
                    }
                    .bed-row {
                        display: flex;
                        justify-content: center;
                        width: 100%;
                        margin-bottom: 20px;
                    }
                    .bed-icon {
                        cursor: pointer;
                        text-align: center;
                        margin: 5px;
                        transition: transform 0.3s ease;
                        width: calc(20% - 10px); /* 20% for 5 beds in a row with 10px margin */
                        background: white; /* Bright contrast for better visibility */
                        border-radius: 4px; /* Rounded corners */
                        box-shadow: 0 2px 5px rgba(0,0,0,0.15); /* Smooth shadow for 3D effect */
                    }
                    .bed-icon:hover {
                        transform: translateY(-5px); /* Lifting effect on hover */
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2); /* Deeper shadow on hover for a "raised" effect */
                    }
                    .bed-icon img {
                        width: 100%;
                        border-top-left-radius: 4px; /* Rounded corners for image */
                        border-top-right-radius: 4px;
                    }
                    .bed-icon span {
                        display: block;
                        margin-top: 5px;
                        color: #333; /* Dark color for text for readability */
                        padding: 5px;
                    }
                `;
                bedIconsHtml += '</style><div class="bed-container">';

                for (var i = 0; i < ava_bed_list.length; i++) {
                    if (i % 5 === 0 && i !== 0) {
                        bedIconsHtml += '</div><div class="bed-row">';
                    }
                    bedIconsHtml += `
                        <div class="bed-icon" onclick="showBedDetails('${ava_bed_list[i]}')">
                            <img src="/files/bed_icon.png" alt="Bed Icon"/>
                            <span>Bed ${ava_bed_list[i]}</span>
                        </div>
                    `;
                }
                // Close any unclosed bed-row div
                if (ava_bed_list.length % 5 !== 0) {
                    bedIconsHtml += '</div>';
                }

                bedIconsHtml += '</div>';
                document.getElementById('summary-container').innerHTML = bedIconsHtml;
                document.getElementById('summary-container').classList.remove('hidden');
            }
        }
    });
}


function showBedDetails(bedNumber) {
	var existingModal = document.getElementById('bedDetailModal');
    if (existingModal) {
        existingModal.parentNode.removeChild(existingModal);
    }
    var modalHtml = `
        <div id="bedDetailModal" class="modal" style="display: block; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4);">
            <div class="modal-content" style="background-color: #fefefe; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 40%; border-radius: 5px; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);">
                <span class="close" onclick="closeModal()" style="color: #aaa; float: right; font-size: 28px; font-weight: bold;">&times;</span>
                <h2>Details for Bed ${bedNumber}</h2>
                <div class="field-group">
                    <label for="patient_id">Patient ID</label>
                    <select id="patient_id" name="patient_id" style="width: 100%; padding: 8px; margin-top: 5px; border-radius: 4px; border: 1px solid #ccc;">
                        <option value="">Select a patient</option>
                    </select>
                </div>
				<div class="field-group">
                <label for="patient_type">Patient Type</label>
                <select id="patient_type" name="patient_type" style="width: 100%; padding: 8px; margin-top: 5px; border-radius: 4px; border: 1px solid #ccc;">
                    <option value=""></option>
                    <option value="OP">OP</option>
                    <option value="Emergency">Emergency</option>
                </select>
            </div>
                <button onclick="submitBedDetails('${bedNumber}')" style="background-color: #4CAF50; color: white; padding: 10px 20px; margin-top: 10px; border: none; border-radius: 4px; cursor: pointer;">Submit</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    fetchPatients();
}

function closeModal() {
    var modal = document.getElementById('bedDetailModal');
    modal.style.display = 'none';
    modal.parentNode.removeChild(modal);
}

function fetchPatients() {
    frappe.call({
        method: 'healthcare_ai.patient_management.page.ip_patient_managemen.ip_patient_managemen.get_waiting_patient',
        args: {
            'ward_number': ward_number
        },
        callback: function(r) {
			console.log(r.message)
            let patients; 
            if (r.message) {
                patients = r.message; 
            } else {
                patients = []; 
            }

            const patientSelect = document.getElementById('patient_id');
            patientSelect.innerHTML = ''; 

            
            patients.forEach(patient => {
                const option = new Option(`${patient.patient_name} - [${patient.patient_id}]`, patient.id);
                patientSelect.add(option);
            });
        }
    });
}


function submitBedDetails(bedNumber) {
    var patientId_pop_up = document.getElementById('patient_id').value;
    var patientType = document.getElementById('patient_type').value;
	var patientId = patientId_pop_up.split('[')[1].slice(0,-1)
	frappe.call({
		method:'healthcare_ai.patient_management.page.ip_patient_managemen.ip_patient_managemen.update_patient_status',
		args:{
			'bed_number':bedNumber,
			'patient_id':patientId
		}
	})
    closeModal();
}

function closeModal() {
    var modal = document.getElementById('bedDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function applyCardStyles() {
    let styles = `
			.container page-body{
				background: #ffffff;
		}
		.topright {
			position: absolute;
			top: -20px;
			right: 16px;
			font-size: 18px;
		}

		.dashboard {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.row {
			display: flex;
			
			margin-top: 20px;
		}
		.number {
			font-size: 8;
			font-weight: bold;
			color: #007bff; ;
			padding: 8px; 
		}

		.card {
			width: 300px;
			height: 170px;
			background-color: #ffffff;
			margin: 10px;
			padding: 20px;
			border: 1px solid #ccc;
			border-radius: 5px;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
			transition: transform 0.3s ease-in-out; /* Animation transition */
			transform-origin: center center;
			position: relative; /* Position relative for pseudo-elements */
			overflow: hidden; /* Hide overflow content */
		


			
			color: #333;
			font-family: Arial, sans-serif;
			cursor: pointer;
		}


		.card::before {
			content: attr(data-title); 
			position: absolute;
			top: 10px;
			left: 10px;
			font-size: 12px;
			font-weight: bold;
			color: #555;
			text-transform: uppercase;
		}

		/* Hover effect */
		.card:hover {
			transform: scale(1.05); /* Scale up on hover */
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
			background-image: linear-gradient(to bottom right, #E0E0E0, #D1D1D1);
		}
		@media (max-width: 768px) {
			.card {
				width: 100%; /* Cards occupy full width on smaller screens */
			}
		}

		@media (min-width: 1200px) {
			.card {
				width: 200px;
			
			}

		}

		.bed-container {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			padding: 10px;
		}

		.bed-icon {
			cursor: pointer;
			text-align: center;
			margin: 10px;
		}

		.bed-icon img {
			width: 50px; /* Adjust size based on your needs */
		}

		.modal {
			display: none;
			position: fixed;
			z-index: 1;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			overflow: auto;
			background-color: rgba(0,0,0,0.4);
		}

		.modal-content {
			background-color: #fefefe;
			margin: 15% auto;
			padding: 20px;
			border: 1px solid #888;
			width: 80%;
		}

		.close {
			color: #aaaaaa;
			float: right;
			font-size: 28px;
			font-weight: bold;
		}

		.close:hover,
		.close:focus {
			color: #000;
			text-decoration: none;
			cursor: pointer;
		}
		`;

    let styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
}

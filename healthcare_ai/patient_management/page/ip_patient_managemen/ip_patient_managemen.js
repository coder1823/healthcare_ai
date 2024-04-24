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
                        padding: 10px;
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
                    }
                    .bed-icon:hover {
                        transform: scale(1.1);
                    }
                    .bed-icon img {
                        width: 100%; /* Adjust size based on your needs */
                    }
                    .bed-icon span {
                        display: block;
                        margin-top: 5px;
                    }
                `;
                bedIconsHtml += '</style><div class="bed-container">';

                for (var i = 0; i < ava_bed_list.length; i++) {
                    if (i % 5 === 0) {
                        bedIconsHtml += '<div class="bed-row">';
                    }
                    bedIconsHtml += `
                        <div class="bed-icon" onclick="showBedDetails('${ava_bed_list[i]}')">
                            <img src="/files/bed_icon.png" alt="Bed Icon"/>
                            <span>Bed ${ava_bed_list[i]}</span>
                        </div>
                    `;
                    if ((i + 1) % 5 === 0) {
                        bedIconsHtml += '</div>';
                    }
                }

                bedIconsHtml += '</div>';
                document.getElementById('summary-container').innerHTML = bedIconsHtml;
                document.getElementById('summary-container').classList.remove('hidden');
            }
        }
    });
}

function showBedDetails(bedNumber) {
    // Create a modal element (or use an existing one)
    frappe.prompt([
        {
            'fieldname': 'patient_id',
            'fieldtype': 'Link',
            'options': 'Patient',
            'label': 'Patient ID'
        },
        {
            'fieldname': 'patient_type',
            'fieldtype': 'Select',
            'options': 'Inpatient\nOutpatient',
            'label': 'Patient Type'
        }
    ],
    function(values){
        // Your logic to submit the bed details
        console.log("Bed Number:", bedNumber);
        console.log("Patient ID:", values.patient_id);
        console.log("Patient Type:", values.patient_type);
        // Close the modal
        closeModal();
    },
    'Bed Details',
    'Submit'
    );
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
			height: 150px;
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

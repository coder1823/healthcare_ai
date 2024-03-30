// Copyright (c) 2024, kaviraj P R and contributors
// For license information, please see license.txt

frappe.ui.form.on('Healthcare Practitioner', {
    refresh: function(frm) {
        frappe.call({
            'method': 'healthcare_ai.healthcare_staff_management.doctype.healthcare_practitioner.healthcare_practitioner.active_role',
            callback: function(r) {
                if (r.message) {
                    var active_role = r.message;
                    frm.set_query('role', function() {
                        return {
                            filters: {
                                'name': ['in', active_role]
                            }
                        };
                    });
                }
            }
        });
    }
});

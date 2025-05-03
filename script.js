const apiBase = 'https://localhost:44336/api';

// Load allstudent from DB in the table
async function loadStudents() {
  try {
    const res = await fetch(`${apiBase}/student`);
    if (!res.ok) throw new Error('Error al obtener estudiantes');
    const students = await res.json();
    renderStudents(students);
  } catch (err) {
    console.error(err);
  }
}
// Render students in the table
function renderStudents(students) {
  const tbody = document.getElementById('student-table-body');
  const search = document.getElementById('search-student').value.toLowerCase();
  tbody.innerHTML = '';

  students
    .filter(s =>
      (`${s.firstName} ${s.lastName} ${s.middleName}`.toLowerCase().includes(search))
    )
    .forEach(student => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.firstName} ${student.middleName || ''} ${student.lastName}</td>
        <td>${getGenderLabel(student.gender)}</td>
        <td>${student.address?.addressLine || '—'}</td>
        <td>
  <button class="btn btn-sm btn-outline-primary btn-phone" data-id="${student.studentId}">📞</button>
</td>
<button class="btn btn-sm btn-outline-secondary btn-email" data-id="${student.studentId}">✉️</button>
   <td>
  <button class="btn btn-sm btn-warning btn-edit-student" data-id="${student.studentId}">✏️</button>
  <button class="btn btn-sm btn-danger btn-delete-student" data-id="${student.studentId}">🗑️</button>
  <button class="btn btn-sm btn-info btn-view-details" data-id="${student.studentId}">👁️</button>
</td>
      `;
      tbody.appendChild(row);
    });
    attachEditStudentListeners();
    attachDeleteStudentListeners();
    attachPhoneListeners();
    attachEmailListeners();
    attachViewDetailsListeners();
}
//Listeners for the edit button
// When the edit button is clicked, show the edit modal
function attachEditStudentListeners() {
    document.querySelectorAll('.btn-edit-student').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
  
        try {
          const res = await fetch(`${apiBase}/student/${id}`);
          const student = await res.json();
  
          // Llenar los campos del modal
          document.getElementById('edit-student-id').value = student.studentId;
          document.getElementById('edit-firstName').value = student.firstName;
          document.getElementById('edit-middleName').value = student.middleName ?? '';
          document.getElementById('edit-lastName').value = student.lastName;
          document.getElementById('edit-gender').value = student.gender;
          document.getElementById('edit-addressId').value = student.addressId ?? '';
  
          await populateEditAddressDropdown(student.addressId);
  
          const modal = new bootstrap.Modal(document.getElementById('editStudentModal'));
          modal.show();
        } catch (err) {
          console.error(err);
          alert('Error al cargar el estudiante.');
        }
      });
    });
  }
//Listeners for the edit address button
// When the edit address button is clicked, show the edit address modal
function attachEditAddressListeners() {
    document.querySelectorAll('.btn-edit-address').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
  
        try {
          const res = await fetch(`${apiBase}/address/${id}`);
          const address = await res.json();
  
          document.getElementById('edit-address-id').value = address.addressId;
          document.getElementById('addressLine').value = address.addressLine;
          document.getElementById('city').value = address.city;
          document.getElementById('state').value = address.state;
          document.getElementById('zipPostCode').value = address.zipPostCode;
  
          const modal = new bootstrap.Modal(document.getElementById('addressModal'));
          modal.show();
        } catch (err) {
          console.error(err);
          alert("Error al cargar dirección.");
        }
      });
    });
  }
//Listeners for the delete button
// When the delete button is clicked, show a confirmation dialog and delete the student  
function attachDeleteStudentListeners() {
    document.querySelectorAll('.btn-delete-student').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const confirmDelete = confirm("¿Estás seguro de eliminar este estudiante?");
  
        if (!confirmDelete) return;
  
        try {
          const res = await fetch(`${apiBase}/student/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error("Error al eliminar estudiante");
          loadStudents();
        } catch (err) {
          console.error(err);
          alert("No se pudo eliminar el estudiante.");
        }
      });
    });
  }
//Listeners for the delete address button
// When the delete address button is clicked, show a confirmation dialog and delete the address
  function attachDeleteAddressListeners() {
    document.querySelectorAll('.btn-delete-address').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const confirmDelete = confirm("¿Eliminar esta dirección? Los estudiantes que la tienen asignada quedarán sin dirección.");
  
        if (!confirmDelete) return;
  
        try {
          const res = await fetch(`${apiBase}/address/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error("Error al eliminar dirección");
          loadAddresses();
        } catch (err) {
          console.error(err);
          alert("No se pudo eliminar la dirección.");
        }
      });
    });
  }
//Listeners for the phone button
// When the phone button is clicked, show the phone modal
function attachPhoneListeners() {
    document.querySelectorAll('.btn-phone').forEach(btn => {
      btn.addEventListener('click', async () => {
        const studentId = btn.dataset.id;
        document.getElementById('phone-student-id').value = studentId;
        await loadStudentPhones(studentId);
        const modal = new bootstrap.Modal(document.getElementById('phoneModal'));
        modal.show();
      });
    });
  }
  //Listeners for the delete phone button
// When the delete phone button is clicked, show a confirmation dialog and delete the phone
function attachDeletePhoneListeners() {
    document.querySelectorAll('.btn-delete-phone').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const studentId = document.getElementById('phone-student-id').value;
        const confirmDelete = confirm("¿Eliminar este teléfono?");
        if (!confirmDelete) return;
  
        try {
          const res = await fetch(`${apiBase}/phone/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error("Error al eliminar teléfono");
          await loadStudentPhones(studentId);
        } catch (err) {
          console.error(err);
          alert("No se pudo eliminar el teléfono.");
        }
      });
    });
  }
  //Listeners for the email button
// When the email button is clicked, show the email modal
function attachEmailListeners() {
    document.querySelectorAll('.btn-email').forEach(btn => {
      btn.addEventListener('click', async () => {
        const studentId = btn.dataset.id;
        document.getElementById('email-student-id').value = studentId;
        await loadStudentEmails(studentId);
        const modal = new bootstrap.Modal(document.getElementById('emailModal'));
        modal.show();
      });
    });
  }
  //Listeners for the delete email button
// When the delete email button is clicked, show a confirmation dialog and delete the email
function attachDeleteEmailListeners() {
    document.querySelectorAll('.btn-delete-email').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const studentId = document.getElementById('email-student-id').value;
        const confirmDelete = confirm("¿Eliminar este correo?");
        if (!confirmDelete) return;
  
        try {
          const res = await fetch(`${apiBase}/email/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error("Error al eliminar correo");
          await loadStudentEmails(studentId);
        } catch (err) {
          console.error(err);
          alert("No se pudo eliminar el correo.");
        }
      });
    });
  }
  //Gender labels
function getGenderLabel(gender) {
  switch (gender) {
    case 1: return 'Masculino';
    case 2: return 'Femenino';
    case 3: return 'Otro';
    default: return '—';
  }
}
//Phone and email type labels
function getPhoneTypeLabel(type) {
  switch (type) {
    case 1: return "Móvil";
    case 2: return "Casa";
    case 3: return "Trabajo";
    default: return "—";
  }
}
function getEmailTypeLabel(type) {
  switch (type) {
    case 1: return "Personal";
    case 2: return "Trabajo";
    case 3: return "Escuela";
    default: return "—";
  }
}
// =====================
// 🔄 Load Addresses
// =====================
async function loadAddresses() {
  try {
    const res = await fetch(`${apiBase}/address`);
    if (!res.ok) throw new Error('Error al obtener direcciones');
    const addresses = await res.json();
    renderAddresses(addresses);
  } catch (err) {
    console.error(err);
  }
}
//Render addresses in the table
function renderAddresses(addresses) {
  const tbody = document.getElementById('address-table-body');
  const search = document.getElementById('search-address').value.toLowerCase();
  tbody.innerHTML = '';

  addresses
    .filter(a =>
      a.addressLine.toLowerCase().includes(search)
    )
    .forEach(address => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${address.addressLine}</td>
        <td>${address.city}</td>
        <td>${address.state}</td>
        <td>${address.zipPostCode}</td>
      <td>
  <button class="btn btn-sm btn-warning btn-edit-address" data-id="${address.addressId}">✏️</button>
  <button class="btn btn-sm btn-danger btn-delete-address" data-id="${address.addressId}">🗑️</button>
</td>

      `;
      tbody.appendChild(row);
    });
    attachEditAddressListeners();
    attachDeleteAddressListeners();
}
//debounce function to limit the rate at which a function can fire
// This is useful for optimizing performance when dealing with events like scroll or resize
function debounce(func, delay = 300) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }
// =====================
// 📌 Listeners
// =====================
document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
  //When the button is clicked, show the student modal
  document.getElementById('btn-add-student').addEventListener('click', () => {
    populateAddressDropdown(); // Load addresses into the dropdown
    const modal = new bootstrap.Modal(document.getElementById('studentModal'));
    modal.show();
  });
  // When the button is clicked, show the address modal
  document.getElementById('btn-add-address').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('addressModal'));
    modal.show();
  });
  document.getElementById('search-student').addEventListener('input', debounce(loadStudents,400));
  document.getElementById('search-address').addEventListener('input', debounce(loadAddresses),400);

//LoadStudent when the tab is clicked
  document.getElementById('students-tab').addEventListener('click', loadStudents);

// Load addresses when the tab is clicked
  document.getElementById('addresses-tab').addEventListener('click', loadAddresses);
});

// Event listener for the student form submission
document.getElementById('student-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    ['email', 'phoneNumber'].forEach(field => {
        document.getElementById(field).classList.remove('is-invalid');
        document.getElementById(`${field}-error`).textContent = '';
      });
    const studentData = {
      firstName: document.getElementById('firstName').value,
      middleName: document.getElementById('middleName').value,
      lastName: document.getElementById('lastName').value,
      gender: parseInt(document.getElementById('gender').value),
      email: document.getElementById('email').value,
      emailType: parseInt(document.getElementById('emailType').value),
      phoneNumber: document.getElementById('phoneNumber').value,
      phoneType: parseInt(document.getElementById('phoneType').value),
      countryCode: document.getElementById('countryCode').value,
      areaCode: document.getElementById('areaCode').value,
      addressId: document.getElementById('addressId').value || null 
    };
  
    try {
      const res = await fetch(`${apiBase}/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
  
      if (!res.ok) {
        const error = await res.json();
        if (error.errors) {
          Object.keys(error.errors).forEach(key => {
            const input = document.getElementById(key);
            const feedback = document.getElementById(`${key}-error`);
            if (input && feedback) {
              input.classList.add('is-invalid');
              feedback.textContent = error.errors[key][0];
            }
          });
        } else {
          alert("Error al guardar estudiante.");
        }
        return;
      }
  
      bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
      loadStudents();
    } catch (err) {
      console.error(err);
      alert('Error al guardar estudiante');
    }
  });
  //Event listener for the address form submission
  document.getElementById('address-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const addressId = document.getElementById('edit-address-id')?.value || null;
  
    const addressData = {
      addressId: addressId ? parseInt(addressId) : 0,
      addressLine: document.getElementById('addressLine').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zipPostCode: document.getElementById('zipPostCode').value
    };
  
    const method = addressId ? 'PUT' : 'POST';
    const url = addressId
      ? `${apiBase}/address/${addressId}`
      : `${apiBase}/address`;
  
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData)
      });
  
      if (!res.ok) throw new Error('Error al guardar dirección');
  
      bootstrap.Modal.getInstance(document.getElementById('addressModal')).hide();
      loadAddresses();
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar la dirección.");
    }
  });
  //Event listener for the phone form submission
  // When the form is submitted, add a new phone to the student
  document.getElementById('add-phone-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('phone-student-id').value;
  
    const phoneData = {
      phoneNumber: document.getElementById('new-phoneNumber').value,
      countryCode: document.getElementById('new-countryCode').value,
      areaCode: document.getElementById('new-areaCode').value,
      phoneType: parseInt(document.getElementById('new-phoneType').value),
      studentId: parseInt(studentId)
    };
  
    try {
      const res = await fetch(`${apiBase}/phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phoneData)
      });
  
      if (!res.ok) throw new Error("Error al agregar teléfono");
      await loadStudentPhones(studentId);
      e.target.reset();
    } catch (err) {
      console.error(err);
      alert("No se pudo agregar el teléfono.");
    }
  });
  //Event listener for the email form submission
  // When the form is submitted, add a new email to the student
  document.getElementById('add-email-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('email-student-id').value;
  
    const emailData = {
      emailAddress: document.getElementById('new-email').value,
      emailType: parseInt(document.getElementById('new-emailType').value),
      studentId: parseInt(studentId)
    };
  
    try {
      const res = await fetch(`${apiBase}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });
  
      if (!res.ok) throw new Error("Error al agregar correo");
      await loadStudentEmails(studentId);
      e.target.reset();
    } catch (err) {
      console.error(err);
      alert("No se pudo agregar el correo.");
    }
  });
  
  // Load addresses into the dropdown when the modal is shown
  async function populateAddressDropdown() {
    try {
      const res = await fetch(`${apiBase}/address`);
      if (!res.ok) throw new Error('Error al cargar direcciones');
  
      const addresses = await res.json();
      const select = document.getElementById('addressId');
      select.innerHTML = '<option value="">-- Sin dirección asignada --</option>';
  
      addresses.forEach(addr => {
        const option = document.createElement('option');
        option.value = addr.addressId;
        option.textContent = addr.addressLine;
        select.appendChild(option);
      });
    } catch (err) {
      console.error(err);
      alert('No se pudieron cargar las direcciones');
    }
  }
    
  // Load addresses into the dropdown when the modal is shown
  async function populateEditAddressDropdown(selectedAddressId = null) {
    try {
      const res = await fetch(`${apiBase}/address`);
      if (!res.ok) throw new Error('Error al cargar direcciones');
  
      const addresses = await res.json();
      const select = document.getElementById('edit-addressId');
      select.innerHTML = '<option value="">-- Sin dirección asignada --</option>';
  
      addresses.forEach(addr => {
        const option = document.createElement('option');
        option.value = addr.addressId;
        option.textContent = addr.addressLine;
        select.appendChild(option);
      });
  
      select.value = selectedAddressId !== null ? selectedAddressId.toString() : '';
    } catch (err) {
      console.error(err);
      alert('No se pudieron cargar las direcciones');
    }
  }
  //Submit the edit form to update the student
  document.getElementById('edit-student-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const studentId = document.getElementById('edit-student-id').value;
  
    const studentData = {
      studentId: parseInt(studentId),
      firstName: document.getElementById('edit-firstName').value,
      middleName: document.getElementById('edit-middleName').value || null,
      lastName: document.getElementById('edit-lastName').value,
      gender: parseInt(document.getElementById('edit-gender').value),
      addressId: document.getElementById('edit-addressId').value || null
    };
  
    try {
      const res = await fetch(`${apiBase}/student/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
  
      if (!res.ok) throw new Error('No se pudo actualizar el estudiante.');
  
      bootstrap.Modal.getInstance(document.getElementById('editStudentModal')).hide();
      loadStudents();
    } catch (err) {
      console.error(err);
      alert('Error al guardar los cambios.');
    }
  });
  //Load student phones and emails when the phone or email button is clicked
  async function loadStudentPhones(studentId) {
    const res = await fetch(`${apiBase}/phone/by-student/${studentId}`);
    const phones = await res.json();
  
    const list = document.getElementById('student-phone-list');
    list.innerHTML = '';
  
    phones.forEach(phone => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
      li.innerHTML = `
        <span>${phone.phoneNumber} (${getPhoneTypeLabel(phone.phoneType)})</span>
        <button class="btn btn-sm btn-danger btn-delete-phone" data-id="${phone.phoneId}">🗑️</button>
      `;
      list.appendChild(li);
    });
  
    attachDeletePhoneListeners(); // siguiente paso
  }
  
  async function loadStudentEmails(studentId) {
    const res = await fetch(`${apiBase}/email/by-student/${studentId}`);
    const emails = await res.json();
  
    const list = document.getElementById('student-email-list');
    list.innerHTML = '';
  
    emails.forEach(email => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
      li.innerHTML = `
        <span>${email.emailAddress} (${getEmailTypeLabel(email.emailType)})</span>
        <button class="btn btn-sm btn-danger btn-delete-email" data-id="${email.emailId}">🗑️</button>
      `;
      list.appendChild(li);
    });
  
    attachDeleteEmailListeners();
  }
  //Load student details when the view details button is clicked
  // When the view details button is clicked, show the details modal
  function attachViewDetailsListeners() {
    document.querySelectorAll('.btn-view-details').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
  
        try {
          const res = await fetch(`${apiBase}/student/${id}`);
          if (!res.ok) throw new Error("No se pudo cargar los detalles");
          const student = await res.json();
  
          document.getElementById('detail-name').textContent =
            `${student.firstName} ${student.middleName || ''} ${student.lastName}`;
          document.getElementById('detail-gender').textContent = getGenderLabel(student.gender);
          document.getElementById('detail-address').textContent =
            student.address ? student.address.addressLine : 'Sin dirección asignada';
  
          // Teléfonos
          const phoneList = document.getElementById('detail-phones');
          phoneList.innerHTML = '';
          student.phones.forEach(phone => {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.textContent = `${phone.phoneNumber} (${getPhoneTypeLabel(phone.phoneType)})`;
            phoneList.appendChild(li);
          });
  
          // Correos
          const emailList = document.getElementById('detail-emails');
          emailList.innerHTML = '';
          student.emails.forEach(email => {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.textContent = `${email.emailAddress} (${getEmailTypeLabel(email.emailType)})`;
            emailList.appendChild(li);
          });
  
          const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
          modal.show();
        } catch (err) {
          console.error(err);
          alert("Error al cargar los detalles del estudiante.");
        }
      });
    });
  }
  
  
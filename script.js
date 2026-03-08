(async function () {
    // 1. Initialize State
    let employees = JSON.parse(localStorage.getItem('employees')) || [];
    let selectedEmployeeId = employees.length > 0 ? employees[0].id : null;
    let selectedEmployee = employees.length > 0 ? employees[0] : null;

    // 2. Select DOM Elements
    const empList = document.querySelector(".emp-list-items");
    const empInfo = document.querySelector(".emp-detail-info");
    const addModal = document.querySelector(".modal");
    const editModal = document.querySelector(".edit-modal");
    const addForm = document.querySelector(".emp-form");
    const editForm = document.querySelector(".edit-form");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");

    // 3. Helper: Save and Refresh UI
    const updateUI = () => {
        localStorage.setItem('employees', JSON.stringify(employees));
        renderEmployeeList();
        renderSingleEmployee();
        updateStats();
    };

    const updateStats = () => {
        document.getElementById("totalEmployees").innerText = employees.length;
        const avg = employees.length 
            ? Math.round(employees.reduce((acc, curr) => acc + Number(curr.salary), 0) / employees.length) 
            : 0;
        document.getElementById("avgSalary").innerText = `$${avg.toLocaleString()}`;
    };

    // 4. CRUD Logic: Add Employee
    document.querySelector(".add-btn").addEventListener("click", () => {
        addModal.style.display = "flex";
    });

    addForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(addForm);
        const values = Object.fromEntries(formData.entries());
        
        const newEmp = {
            ...values,
            id: Date.now(),
            imageUrl: values.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            age: new Date().getFullYear() - new Date(values.dob).getFullYear()
        };

        employees.push(newEmp);
        selectedEmployeeId = newEmp.id;
        selectedEmployee = newEmp;
        addForm.reset();
        addModal.style.display = "none";
        updateUI();
    });

    // 5. CRUD Logic: Delete / Select / Edit
    empList.addEventListener("click", (e) => {

    const item = e.target.closest(".emp-item");
    if (!item) return;

    const id = parseInt(item.dataset.id);

    if (e.target.classList.contains("emp-delete")) {

        employees = employees.filter(emp => emp.id !== id);

        if (id === selectedEmployeeId) {
            selectedEmployee = employees[0] || null;
            selectedEmployeeId = selectedEmployee?.id || null;
        }

        updateUI();
        return;
    }

    selectedEmployeeId = id;
    selectedEmployee = employees.find(emp => emp.id === id);

    renderEmployeeList();
    renderSingleEmployee();
});

    // 6. Rendering Logic
    const renderEmployeeList = () => {
        let filtered = employees.filter(emp => 
            `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchInput.value.toLowerCase())
        );

        // Sorting Logic
        const sortVal = sortSelect.value;
        filtered.sort((a, b) => {
            if (sortVal === "salary") return Number(a.salary) - Number(b.salary);
            if (sortVal === "salaryDesc") return Number(b.salary) - Number(a.salary);
            if (sortVal === "age") return a.age - b.age;
            if (sortVal === "ageDesc") return b.age - a.age;
            if (sortVal === "nameDesc") return b.firstName.localeCompare(a.firstName);
            return a.firstName.localeCompare(b.firstName);
        });

        empList.innerHTML = "";
        filtered.forEach(emp => {
            const item = document.createElement("div");
            item.classList.add("emp-item");
            if (emp.id === selectedEmployeeId) item.classList.add("selected");
            item.dataset.id = emp.id;
            item.innerHTML = `
                <span>${emp.firstName} ${emp.lastName}</span>
                <i class="emp-delete">❌</i>
            `;
            empList.append(item);
        });
    };

    const renderSingleEmployee = () => {
        if (!selectedEmployee) {
            empInfo.innerHTML = "<p style='padding:20px'>No employee selected</p>";
            return;
        }
        empInfo.innerHTML = `
            <img src="${selectedEmployee.imageUrl}" alt="Avatar" />
            <div class="emp-single-name">${selectedEmployee.firstName} ${selectedEmployee.lastName} (${selectedEmployee.age})</div>
            <div class="emp-single-details">
                <p><strong>Email:</strong> ${selectedEmployee.email}</p>
                <p><strong>Phone:</strong> ${selectedEmployee.contactNumber}</p>
                <p><strong>Address:</strong> ${selectedEmployee.address}</p>
                <p><strong>Salary:</strong> $${Number(selectedEmployee.salary).toLocaleString()}</p>
                <p><strong>DOB:</strong> ${selectedEmployee.dob}</p>
            </div>
        `;
    };

    // 7. Search & Sort Event Listeners
    searchInput.addEventListener("input", renderEmployeeList);
    sortSelect.addEventListener("change", renderEmployeeList);

    // 8. Close Modals
    window.onclick = (e) => {
        if (e.target === addModal) addModal.style.display = "none";
        if (e.target === editModal) editModal.style.display = "none";
    };
    
    document.querySelectorAll(".cancel-btn").forEach(btn => {
        btn.onclick = () => {
            addModal.style.display = "none";
            editModal.style.display = "none";
        };
    });

    // Initial Load
    updateUI();
})();
const BASE_URL = "http://localhost:8000";
let mode = 'CREATE';
let selectId = '';

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log('id', id);

    if (id){
        mode = 'EDIT'
        selectId = id;

        try {
            const response = await axios.get(`${BASE_URL}/users/${id}`);
            console.log('response',response.data)

            const user = response.data[0]; 

            let firstNameDOM = document.querySelector('input[name=firstname]');
            let lastNameDOM = document.querySelector('input[name=lastname]');
            let ageDOM = document.querySelector('input[name=age]');
            let descriptionDOM = document.querySelector('textarea[name=description]');

            firstNameDOM.value = user.firstname;
            lastNameDOM.value = user.lastname;
            ageDOM.value = user.age;
            descriptionDOM.value = user.description;

            let genderDOM = document.querySelectorAll('input[name=gender]');
            let interestDOMs = document.querySelectorAll('input[name=interests]');

            for(let i = 0; i < genderDOM.length; i++) {
                if (genderDOM[i].value === user.gender) {
                    genderDOM[i].checked = true;
                }
            }

            for (let i = 0; i < interestDOMs.length; i++) {
                if (user.interests.includes(interestDOMs[i].value)) {
                    interestDOMs[i].checked = true;
                }
            }

        } catch (error) {
            console.log('error',error)
        }
    }
}

const validateData = (userData) => {
    let error = [];

    if (!userData.firstName) {
        error.push('กรุณากรอกชื่อ');
    }

    if (!userData.lastName) {
        error.push('กรุณากรอกนามสกุล');
    }

    if (!userData.age) {
        error.push('กรุณากรอกอายุ');
    }

    if (!userData.gender) {
        error.push('กรุณาเลือกเพศ');
    }

    if (!userData.interests) {
        error.push('กรุณาเลือกงานอดิเรก');
    }

    if (!userData.description) {
        error.push('กรุณากรอกคำอธิบาย');
    }

    return error;
};

const submitData = async () => {

    const firstNameDOM = document.querySelector('input[name=firstname]');
    const lastNameDOM = document.querySelector('input[name=lastname]');
    const ageDOM = document.querySelector('input[name=age]');
    const genderDOM = document.querySelector('input[name=gender]:checked');
    const interestDOMs = document.querySelectorAll('input[name=interests]:checked');
    const descriptionDOM = document.querySelector('textarea[name=description]');
    const messageDOM = document.getElementById('message');

    try {

        let interests = Array.from(interestDOMs).map(el => el.value).join(',');

        const userData = {
            firstName: firstNameDOM.value,
            lastName: lastNameDOM.value,
            age: ageDOM.value,
            gender: genderDOM ? genderDOM.value : '',
            description: descriptionDOM.value,
            interests: interests
        };

        console.log('submitData', userData);

        const errors = validateData(userData);

        if (errors.length > 0) {
            throw {
                message: 'กรอกข้อมูลให้ครบถ้วน',
                errors: errors
            };
        } 

        let message = 'บันทึกข้อมูลสำเร็จ'
    
        if (mode == 'CREATE'){
            const response = await axios.post(`${BASE_URL}/users`,userData);
            console.log('response',response.data);
        } else {
            const response = await axios.put(`${BASE_URL}/users/${selectId}`,userData);
            message = 'แก้ไขข้อมูลสำเร็จ'
            console.log('response',response.data)
        }

        messageDOM.innerText = message;
        messageDOM.className = 'message success';

    } catch (error) {

        console.log('error message:', error.message);
        console.log('error',error.errors)

        if (error.response){
            console.log('Error message',error.response.data);
            error.message = error.response.data.message
            error.errors = error.response.data.errors
        }

        let htmlData = '<div>';
        htmlData += `<div>${error.message}</div>`;
        htmlData += '<ul>';

        for (let i = 0; i < error.errors.length; i++) {
            htmlData += `<li>${error.errors[i]}</li>`;
        }

        htmlData += '</ul>';
        htmlData += '</div>';

        messageDOM.innerHTML = htmlData;
        messageDOM.className = 'message danger';
    }
};
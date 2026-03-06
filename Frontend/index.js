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

        // รวม interests
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

        const response = await axios.post('http://localhost:8000/users', userData);

        console.log('response', response);

        messageDOM.innerText = 'บันทึกข้อมูลสำเร็จ';
        messageDOM.className = 'message success';

    } catch (error) {

        console.log('error message:', error.message);

        let htmlData = '<div>';
        htmlData += `<p>${error.message || 'เกิดข้อผิดพลาด'}</p>`;

        if (Array.isArray(error.errors)) {
            htmlData += '<ul>';

            error.errors.forEach(err => {
                htmlData += `<li>${err}</li>`;
            });

            htmlData += '</ul>';
        }

        htmlData += '</div>';

        messageDOM.innerHTML = htmlData;
        messageDOM.className = 'message danger';
    }
};
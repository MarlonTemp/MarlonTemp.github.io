// **************** CORDIC DEMO FUNCTIONS ****************

export function getAtanAngles(iterations) {
    let angles = [];

    for (let i = 0; i < iterations; i++) {
        angles[i] = Math.atan(Math.pow(2, -i)); // angles in radians
    }

    return angles;
}

export function getCosK(iterations) {
    let angles = getAtanAngles(iterations);
    let cosK = 1;

    for (let i = 0; i < iterations; i++) {
        cosK *= Math.cos(angles[i]);
    }

    return cosK;
}

export function getSinCosDegrees(angle, iterations) {
    let xi = 1;
    let yi = 0;
    let totalAngle = 0;
    let angles = getAtanAngles(iterations);
    let cosK = getCosK(iterations);
    let xd = 1; //direction (1 for positive, -1 for negative)
    let yd = 1;
    let targetAngle = angle % 360;
    
    if (targetAngle < 0) {
        targetAngle += 360;
    }

    if (targetAngle > 180) {
        targetAngle -= 180;
        yd = -1;
        xd = -1;
    }

    if (targetAngle > 90) {
        xd *= -1;
        targetAngle = 180 - targetAngle;
    } 

    if (targetAngle > 90) {
        targetAngle = 180 - targetAngle;
        xd = -1;
    }

    targetAngle = targetAngle * (Math.PI / 180); // convert to radians

    for (let i = 0; i < iterations; i++) {
        if (totalAngle < targetAngle) {
            totalAngle += angles[i];
            let xj = xi - (yi * (Math.pow(2, -i)));
            let yj = yi + (xi * (Math.pow(2, -i)));
            xi = xj;
            yi = yj;
        }
        else {
            totalAngle -= angles[i];
            let xj = xi + (yi * (Math.pow(2, -i)));
            let yj = yi - (xi * (Math.pow(2, -i)));
            xi = xj;
            yi = yj;
        }
    }

    return [cosK * xi * xd, cosK * yi * yd];

}

export function getSinCos(angle, iterations, angleType = 'degrees') {
    if (angleType === 'degrees') {
        return getSinCosDegrees(angle, iterations);
    } else if (angleType === 'radians') {
        return getSinCosDegrees(angle * (180 / Math.PI), iterations);
    } else {
        throw new Error('Invalid angle type. Use "degrees" or "radians".');
    }
}

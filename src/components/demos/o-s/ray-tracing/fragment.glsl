precision highp float;

uniform vec2 uResolution;
uniform vec3 uCameraPos;
uniform vec3 uLightDir;

float sphereIntersect(vec3 ro, vec3 rd, vec3 center, float radius){
    vec3 oc = ro - center;
    float b = dot(oc, rd);
    float c = dot(oc, oc) - radius*radius;
    float h = b*b - c;
    if(h < 0.0) return -1.0;
    return -b - sqrt(h);
}

float planeIntersect(vec3 ro, vec3 rd, vec3 normal, float height){
    float denom = dot(rd, normal);
    if(abs(denom) < 0.0001) return -1.0;
    return -(dot(ro, normal) + height) / denom;
}

void main(){

    vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;

    vec3 ro = uCameraPos;
    vec3 rd = normalize(vec3(uv, -1.5));

    float t = 1e9;
    vec3 normal;
    vec3 color;
    bool hitPlane = false;

    float ts = sphereIntersect(ro, rd, vec3(0,1,0), 1.0);
    if(ts > 0.0 && ts < t){
        t = ts;
        vec3 p = ro + rd * t;
        normal = normalize(p - vec3(0,1,0));
        color = vec3(1.0,0.2,0.2);
    }

    float tp = planeIntersect(ro, rd, vec3(0,1,0), 0.0);
    if(tp > 0.0 && tp < t){
        t = tp;
        normal = vec3(0,1,0);
        color = vec3(0.8);
        hitPlane = true;
    }

    if(t < 1e8){
        float diff = max(dot(normal, -uLightDir), 0.0);
        float shadow = 1.0;
        if(hitPlane){
            vec3 p = ro + rd * t;
            // Cast shadow ray from plane hit point toward the light
            float shadowHit = sphereIntersect(p + vec3(0.0, 0.001, 0.0), -uLightDir, vec3(0,1,0), 1.0);
            if(shadowHit > 0.0) shadow = 0.15;
        }
        gl_FragColor = vec4(color * diff * shadow, 1.0);
    }else{
        gl_FragColor = vec4(0.7,0.9,1.0,1.0);
    }
}
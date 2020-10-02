export function truncateEmail(email){
    var res = email.split("@");
    return res[0];
}
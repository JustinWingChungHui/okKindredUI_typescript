export default interface InviteEmail {
    person_id: string;
    person_name: string;
    email_address: string;
    sent: Date;
    username_who_invited_person: string;
    language: string;
}

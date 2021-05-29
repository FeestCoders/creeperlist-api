import BaseModel from './base.model';

export default class User extends BaseModel {

    static tableName = 'serverid';

    static jsonSchema = {
        type: 'object',

        properties: {
            id: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            server_name: { type: 'string', minLength: 1, maxLength: 255 },
            server_ip: { type: 'string', minLength: 1, maxLength: 255 },
            server_port: { type: 'strinh', minLength: 1, maxLength: 9 },
            server_description: { type: 'string', minLength: 20, maxLength: 255 },
            votifier_host: { type: 'string', minLength: 1, maxLength: 255 },
            votifier_port: { type: 'string', minLength: 1, maxLength: 255 },
            votifier_public_key: { type: 'string', minLength: 1, maxLength: 255 },
            server_website: { type: 'string', minLength: 4, maxLength: 255 },
            server_discord: { type: 'string', minLength: 16, maxLength: 255 },
            server_country: { type: 'string', minLength: 1, maxLength: 255 }
        },

        required: [
            'server_name', 'server_ip', 'server_port', 'server_description', 'server_country'
        ]
    };

}

import { ServeridInputError } from 'apollo-server-express';
import { isServerid } from 'validator';

export const validators = {

    Mutation: {

        editserverid: (resolve, obj, args, context) => {
            const { Serverid } = args.editServeridReq;

            if (!isServerid(Serverid)) {
                throw new ServeridInputError('Invalid Server id!');
            }

            return resolve(obj, args, context);
        }
    }
};

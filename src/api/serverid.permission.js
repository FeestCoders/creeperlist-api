import { isServeridManager } from '../utils/shield';

export const permissions = {

    Query: {

        serveridById: isServeridManager,

        serverids: isServeridManager
    },

    Mutation: {

        editserverid: isServeridManager,

        deleteserverid: isServeridManager
    }
};

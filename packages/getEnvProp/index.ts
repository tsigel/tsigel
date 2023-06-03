import { error, info } from '@tsigel/logger';

export const getRequiredProp = (prop_name: string): string => {
    info(`Get ${prop_name} from ENV`);
    const value = process.env[prop_name];

    if (!value) {
        error(`Has no required property ${prop_name} in env!`);
        process.exit(1);
    }
    return value;
};

export const getRequiredNumProp = (prop_name: string): number => {
    const value = Number(getRequiredProp(prop_name));
    if (isNaN(value)) {
        error(`Invalid number property ${prop_name}!`);
        process.exit(1);
    }
    return value;
}

export const getRequiredBoolProp = (prop_name: string): boolean => {
    const value = getRequiredProp(prop_name);
    const available_values = ['1', '0', 'true', 'false'];
    if (!available_values.includes(value)) {
        error(`Invalid value in prop ${prop_name}! Available values is ${available_values.join(', ')}.`);
        process.exit(1);
    }
    return ['1', 'ture'].includes(value);
}

import { postCommandGetTeamRecentFiles } from '@figpot/src/clients/penpot';

// TODO: any types are temporary until we implement transformation process
export type PenpotPage = any;
export type PenpotNode = any;
export type RectShape = any;
export type BlendMode = any;
export type ShapeBaseAttributes = any;
export type ShapeAttributes = any;
export type ConstraintH = any;
export type ConstraintV = any;
export type ShapeGeomAttributes = any;
export type Blur = any;

export async function push() {
  const data = await postCommandGetTeamRecentFiles({
    requestBody: {
      teamId: 'xxxxxxx',
    },
  });

  console.log(data);
}

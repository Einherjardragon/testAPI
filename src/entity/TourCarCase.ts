import { Entity, PrimaryGeneratedColumn, Index, Column } from "typeorm";

Index(["map_job"]);

@Entity()
export class TourCarCase {

    @PrimaryGeneratedColumn("increment", { type: 'bigint', unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 128, width: 128, default: null })
    patientId: string;

    @Column({ type: 'varchar', length: 256, default: 'N/A', nullable: true })
    studyId: string | null;

    @Column({ type: 'varchar', length: 256, default: 'N/A', nullable: true })
    seriesId: string | null;

    @Column({ type: 'varchar', length: 256, default: 'N/A', nullable: true })
    instancesUUId: string | null;

    @Column({ type: 'varchar', length: 256, width: 256, default: '0' })
    map_job: string;

    @Column({ type: 'varchar', length: 256, width: 256, default: '0' })
    caseName: string;

    @Column({ type: 'int', default: 0 })
    series: number;

    @Column({ type: 'varchar', length: 128, width: 128, default: null })
    status: string;

    @Column({ type: 'tinyint', default: 0 })
    upload: number;

    @Column({ type: 'varchar', length: 256, width: 256, default: null })
    mapping: string;

    @Column({ type: 'tinyint', default: 1 })
    postAI: number;

    @Column({ type: 'tinyint', default: 1 })
    postPACS: number;

}
